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
import {
  Condition,
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';
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
import { useWatch } from 'react-hook-form';
import FancyStepsHeader from '../../../../../components/steps/FancyStepsHeader';
import FancyStepsNavigation from '../../../../../components/steps/FancyStepsNavigation';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useLoading } from '../../../../../contexts/LoadingContext';

export default function MinisterioIntegrantesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();
  const [stepIndex, setStepIndex] = useState(0);
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { showLoading, hideLoading } = useLoading();

  const form = useForm({ resolver: zodResolver(minVoluntarioSchema) });
  const selectedVoluntarioId = useWatch({ control: form.control, name: 'voluntarioId' });

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
            voluntario.fotoThumbUrl || voluntario.fotoUrl
              ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
              : AppImages.emptyProfile,
        },
      })) as DropDownItemProps<string>[];
  }, [voluntariosData, integrantesData, ministerioId]);

  const {
    funcoesList,
    funcoesDropDownList,
    isLoading: isLoadingFuncoes,
  } = useFuncoesDoMinisterio(ministerioId);

  const { add: addVoluntario } = useMinisterioVoluntariosCrud();
  const { add: addFuncaoVoluntario } = useMinisterioVoluntarioFuncoesCrud();

  const selectedVoluntario = useMemo(
    () => voluntariosData.find((voluntario) => voluntario.id === selectedVoluntarioId),
    [selectedVoluntarioId, voluntariosData],
  );

  const handleSave = form.handleSubmit(
    async (data) => {
      if (!ministerioId || !data.voluntarioId) return;
      showLoading('Salvando');

      try {
        const funcoesSelecionadas = (data.funcoes ?? []).filter((f) =>
          funcoesList.some((funcao) => funcao.id === f.id),
        );

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
        hideLoading();
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

  const STEPS: FancyStepsConfig = {
    steps: [
      {
        title: 'Voluntário',
        content: (
          <View style={styles.stepContent}>
            {selectedVoluntario && (
              <View style={styles.previewCard}>
                <FancyImage
                  size={42}
                  source={
                    selectedVoluntario.fotoThumbUrl || selectedVoluntario.fotoUrl
                      ? {
                          uri: selectedVoluntario.fotoThumbUrl || selectedVoluntario.fotoUrl || '',
                        }
                      : AppImages.emptyProfile
                  }
                />
                <View style={styles.previewContent}>
                  <FancyText size='small' type='bold' color={palette.fonts.dark} numberOfLines={1}>
                    {selectedVoluntario.nome}
                  </FancyText>
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={palette.fonts.inactive}
                    numberOfLines={1}
                    ellipsizeMode='middle'
                  >
                    {selectedVoluntario.email ||
                      selectedVoluntario.telefone ||
                      'Voluntário selecionado'}
                  </FancyText>
                </View>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='check-circle'
                  size={20}
                  color={palette.primary}
                />
              </View>
            )}
            <IntegranteFormFields
              mode='add'
              section='voluntario'
              voluntariosDropDownList={voluntariosDropDownList}
              funcoesDropDownList={funcoesDropDownList}
              funcoesList={funcoesList}
            />
          </View>
        ),
        actions: [
          {
            label: 'Anterior',
            icon: {
              library: DefaultIconsNames['arrow-left'].library,
              name: DefaultIconsNames['arrow-left'].name,
              size: 20,
            },
            enabled: false,
          },
          {
            label: 'Próximo',
            icon: {
              library: DefaultIconsNames['arrow-right'].library,
              name: DefaultIconsNames['arrow-right'].name,
              size: 20,
            },
            iconPosition: 'right',
            onPress: async () => {
              const isValid = await form.trigger(['voluntarioId']);
              if (isValid) setStepIndex(1);
            },
          },
        ],
      },
      {
        title: 'Funções',
        content: (
          <View style={styles.stepContent}>
            <IntegranteFormFields
              mode='add'
              section='funcoes'
              voluntariosDropDownList={voluntariosDropDownList}
              funcoesDropDownList={funcoesDropDownList}
              funcoesList={funcoesList}
            />
          </View>
        ),
        actions: [
          {
            label: 'Anterior',
            icon: { library: 'Feather', name: 'arrow-left', size: 20 },
            onPress: 'previous',
          },
          {
            label: 'Finalizar',
            icon: { library: 'Feather', name: 'check', size: 20 },
            iconPosition: 'right',
            onPress: () => handleSave(),
            color: palette.confirm,
          },
        ],
      },
    ],
  };

  if (isLoadingVoluntarios || isLoadingIntegrantes || isLoadingFuncoes) return <FancyLoading />;

  return (
    <FancyPageView style={styles.page}>
      <FancyStepsHeader index={stepIndex} config={STEPS} />
      <FormProvider {...form}>
        <View style={styles.contentContainer}>{STEPS.steps[stepIndex].content}</View>
      </FormProvider>
      <FancyStepsNavigation config={STEPS} stepIndex={stepIndex} setStepIndex={setStepIndex} />
    </FancyPageView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      gap: 16,
      alignItems: 'center',
      paddingHorizontal: 15,
    },
    contentContainer: {
      width: '100%',
      flex: 1,
    },
    stepContent: {
      flex: 1,
      gap: 14,
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
  });
}
