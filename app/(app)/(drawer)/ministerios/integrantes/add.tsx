import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import IntegranteFormFields from '../../../../../components/pages/ministerios/integrantes/FormFields';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { minVoluntarioSchema } from '../../../../../domain/schemas/ministerioVoluntariosSchema';
import { router, useLocalSearchParams } from 'expo-router';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import FancyLoading from '../../../../../components/FancyLoading';
import { useMinisterioVoluntarioFuncoesCrud } from '../../../../../hooks/useMinisterioVoluntarioFuncoesCrud';
import { useIgrejaVoluntariosCrud } from '../../../../../hooks/useIgrejaVoluntariosCrud';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DropDownItemProps } from '../../../../../components/fields/FancyDropDownItem';
import { Condition, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import Toast from 'react-native-toast-message';
import { EscalaTemplateExperienciaEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyText from '../../../../../components/FancyText';
import DefaultIcons from '../../../../../components/FancyIcons';
import FancyImage from '../../../../../components/images/FancyImage';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { useWatch } from 'react-hook-form';

export default function MinisterioIntegrantesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();
  const [isSavingIntegrante, setIsSavingIntegrante] = useState(false);
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  const form = useForm({ resolver: zodResolver(minVoluntarioSchema) });
  const selectedVoluntarioId = useWatch({ control: form.control, name: 'voluntarioId' });
  const selectedFuncoes = useWatch({ control: form.control, name: 'funcoes' }) ?? [];

  const voluntariosParams = useMemo(() => {
    return {
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, []);

  const integrantesParams = useMemo(() => {
    if (!ministerioId) return undefined;
    return {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL as const, value: ministerioId },
          } as Condition,
        ],
      },
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: voluntariosData, isLoading: isLoadingVoluntarios } = useIgrejaVoluntariosCrud({
    autoFetch: true,
    initialParams: voluntariosParams,
  });

  const { data: integrantesData, isLoading: isLoadingIntegrantes } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams: integrantesParams,
  });

  const voluntariosDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    const integrantesIds = new Set(integrantesData.map((i) => i.voluntarioId));

    return voluntariosData
      .filter((v) => !integrantesIds.has(v.id))
      .map((voluntario) => ({
        title: voluntario?.nome,
        value: voluntario?.id,
        left: {
          type: 'image',
          source:
            voluntario.fotoThumbUrl || voluntario.fotoUrl ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' } : AppImages.emptyProfile,
        },
      })) as DropDownItemProps<string>[];
  }, [voluntariosData, integrantesData, ministerioId]);

  const { funcoesList, funcoesDropDownList, isLoading: isLoadingFuncoes } = useFuncoesDoMinisterio(ministerioId);

  const { add: addVoluntario } = useMinisterioVoluntariosCrud();
  const { add: addFuncaoVoluntario } = useMinisterioVoluntarioFuncoesCrud();

  const selectedVoluntario = useMemo(
    () => voluntariosData.find((voluntario) => voluntario.id === selectedVoluntarioId),
    [selectedVoluntarioId, voluntariosData],
  );

  const validSelectedFuncoes = useMemo(
    () => selectedFuncoes.filter((funcao) => funcoesList.some((item) => item.id === funcao.id)),
    [funcoesList, selectedFuncoes],
  );

  const handleSave = form.handleSubmit(
    async (data) => {
      if (!ministerioId || !data.voluntarioId) return;
      setIsSavingIntegrante(true);

      try {
        const funcoesSelecionadas = (data.funcoes ?? []).filter((f) => funcoesList.some((funcao) => funcao.id === f.id));

        const voluntario = await addVoluntario({
          ministerioId,
          voluntarioId: data.voluntarioId,
          hierarquia: VoluntarioHierarquiaEnum.Voluntario,
        });

        for (const f of funcoesSelecionadas) {
          await addFuncaoVoluntario({
            ministerioVoluntarioId: voluntario?.id!,
            funcaoId: f.id,
            experiencia: f.experiencia || EscalaTemplateExperienciaEnum.Iniciante,
            status: MinisterioVoluntarioFuncaoStatusEnum.Ativo,
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Integrante adicionado com sucesso!',
        });

        router.back();
      } catch (error) {
        if (__DEV__) {
          console.log('[Ministerios/Integrantes] Save error:', error);
        }
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar integrante',
        });
      } finally {
        setIsSavingIntegrante(false);
      }
    },
    (errors) => {
      if (__DEV__) {
        console.log('[Ministerios/Integrantes] Validation errors:', errors);
      }
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Verifique os campos do formulário',
      });
    },
  );

  if (isLoadingVoluntarios || isLoadingIntegrantes || isLoadingFuncoes) return <FancyLoading />;

  return (
    <FancyPageView style={styles.page}>
      <FormProvider {...form}>
        <View style={styles.stepper}>
          <StepPill index={1} label='Voluntário' active={!!selectedVoluntarioId} />
          <View style={styles.stepLine} />
          <StepPill index={2} label='Funções' active={validSelectedFuncoes.length > 0} />
          <View style={styles.stepLine} />
          <StepPill index={3} label='Confirmar' active={!!selectedVoluntarioId && validSelectedFuncoes.length > 0} />
        </View>

        {selectedVoluntario && (
          <View style={styles.previewCard}>
            <FancyImage
              size={42}
              source={
                selectedVoluntario.fotoThumbUrl || selectedVoluntario.fotoUrl
                  ? { uri: selectedVoluntario.fotoThumbUrl || selectedVoluntario.fotoUrl || '' }
                  : AppImages.emptyProfile
              }
            />
            <View style={styles.previewContent}>
              <FancyText size='small' type='bold' color={palette.fonts.dark} numberOfLines={1}>
                {selectedVoluntario.nome}
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive} numberOfLines={1} ellipsizeMode='middle'>
                {selectedVoluntario.email || selectedVoluntario.telefone || 'Voluntário selecionado'}
              </FancyText>
            </View>
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='check-circle' size={20} color={palette.primary} />
          </View>
        )}

        <IntegranteFormFields
          mode='add'
          voluntariosDropDownList={voluntariosDropDownList}
          funcoesDropDownList={funcoesDropDownList}
          funcoesList={funcoesList}
        />
      </FormProvider>

      <View style={styles.footerSummary}>
        <View style={styles.footerText}>
          <FancyText size='extraSmall' type='bold' color={palette.fonts.dark} numberOfLines={1}>
            {selectedVoluntario?.nome || 'Selecione um voluntário'}
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive} numberOfLines={1}>
            {validSelectedFuncoes.length
              ? `${validSelectedFuncoes.length} função${validSelectedFuncoes.length === 1 ? '' : 'ões'}: ${validSelectedFuncoes
                  .map((funcao) => `${funcao.nome} (${EscalaTemplateExperienciaLabel[funcao.experiencia!]})`)
                  .join(', ')}`
              : 'Adicione ao menos uma função se quiser escalar por habilidade.'}
          </FancyText>
        </View>
        <FancyButton
          label='Salvar'
          loadingText='Salvando...'
          isLoading={isSavingIntegrante}
          disabled={isSavingIntegrante || !selectedVoluntarioId}
          onPress={handleSave}
          icon={{ library: 'MaterialCommunityIcons', name: 'account-plus', size: 17 }}
          containerStyle={styles.saveButton}
        />
      </View>
    </FancyPageView>
  );
}

function StepPill({ index, label, active }: { index: number; label: string; active: boolean }) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <FancyText size='extraSmall' type='bold' color={active ? palette.fonts.light : palette.fonts.inactive}>
        {index}
      </FancyText>
      <FancyText size='extraSmall' type='semiBold' color={active ? palette.fonts.light : palette.fonts.inactive} numberOfLines={1}>
        {label}
      </FancyText>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 14,
      gap: 14,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stepPill: {
      minHeight: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 9,
      borderRadius: 14,
      backgroundColor: palette.backgroundColor2,
      borderWidth: 1,
      borderColor: palette.borderCard,
    },
    stepPillActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    stepLine: {
      flex: 1,
      height: 1,
      backgroundColor: palette.borderCard,
    },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.18),
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.06),
    },
    previewContent: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    footerSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: palette.borderCard,
    },
    footerText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    saveButton: {
      minWidth: 108,
    },
  });
}
