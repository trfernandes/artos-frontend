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
import { DropDownItemProps } from '../../../../../components/fields/FancyDropDownItem';
import { Condition, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import Toast from 'react-native-toast-message';
import { EscalaTemplateExperienciaEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { AppImages } from '../../../../../assets/app_images';

export default function MinisterioIntegrantesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();
  const [isSavingIntegrante, setIsSavingIntegrante] = useState(false);

  const form = useForm({ resolver: zodResolver(minVoluntarioSchema) });

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
    <FancyPageView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 15, gap: 40 }}>
      <FormProvider {...form}>
        <IntegranteFormFields
          mode='add'
          voluntariosDropDownList={voluntariosDropDownList}
          funcoesDropDownList={funcoesDropDownList}
          funcoesList={funcoesList}
        />
      </FormProvider>
      <FancyButton label={isSavingIntegrante ? 'Salvando...' : 'Salvar'} disabled={isSavingIntegrante} onPress={handleSave} />
    </FancyPageView>
  );
}
