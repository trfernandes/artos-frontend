import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { MinVoluntarioFormData, minVoluntarioSchema } from '../../../../../domain/schemas/ministerioVoluntariosSchema';
import { router, useLocalSearchParams } from 'expo-router';
import { useMinisterioVoluntarioFuncoesCrud } from '../../../../../hooks/useMinisterioVoluntarioFuncoesCrud';
import { useEffect, useMemo } from 'react';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useVoluntariosDoMinisterio } from '../../../../../hooks/useVoluntariosDoMinisterio';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import FancyLoading from '../../../../../components/FancyLoading';
import IntegranteFormFields from '../../../../../components/pages/ministerios/integrantes/FormFields';
import {
  MinisterioVoluntarioFuncaoStatusEnum,
  MinisterioVoluntarioFuncaoStatusEnumMap,
} from '../../../../../domain/models/MinisterioVoluntarioFuncao';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaEnumMap,
} from '../../../../../domain/models/EscalaTemplate';
import Toast from 'react-native-toast-message';
import { UpdateFuncaoDataDto } from '../../../../../domain/services/MinisterioVoluntarioFuncoesRepository';

export default function MinisterioIntegrantesEditPage() {
  const { ministerioId, ministerioVoluntarioId, voluntarioId } = useLocalSearchParams<{
    ministerioId: string;
    ministerioVoluntarioId: string;
    voluntarioId: string;
  }>();

  const { voluntariosDropDownList, isLoading: isLoadingVoluntarios } = useVoluntariosDoMinisterio(ministerioId);

  const { funcoesList, funcoesDropDownList, isLoading: isLoadingFuncoes } = useFuncoesDoMinisterio(ministerioId);

  const funcoesInitialParams = useMemo(() => {
    return {
      where: {
        conditions: [
          {
            path: 'ministerioVoluntarioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioVoluntarioId },
          },
        ],
      },
      relations: ['ministerioVoluntario', 'funcao'],
    } as DynamicQuery;
  }, [ministerioVoluntarioId]);

  const {
    data: minVolFuncoesData,
    isLoading: isLoadingVoluntarioFuncoes,
    updateFuncoes,
    isUpdatingFuncoes,
  } = useMinisterioVoluntarioFuncoesCrud({
    autoFetch: true,
    initialParams: funcoesInitialParams,
  });

  const form = useForm<MinVoluntarioFormData>({
    resolver: zodResolver(minVoluntarioSchema),
    defaultValues: {
      voluntarioId: '',
      funcoes: [],
    },
  });

  useEffect(() => {
    form.reset({
      voluntarioId: voluntarioId || '',
      funcoes: minVolFuncoesData.map(f => ({
        id: f.funcao?.id || f.funcaoId,
        nome: f.funcao?.nome || '',
        status: MinisterioVoluntarioFuncaoStatusEnumMap[f.status] || MinisterioVoluntarioFuncaoStatusEnum.Ativo,
        experiencia: EscalaTemplateExperienciaEnumMap[f.experiencia] || EscalaTemplateExperienciaEnum.Iniciante,
      })),
    });
  }, [minVolFuncoesData]);

  const handleSave = form.handleSubmit(
    async data => {
      await updateFuncoes(ministerioVoluntarioId!, {
        funcoes: data.funcoes?.map(f => ({
          funcaoId: f.id,
          status: MinisterioVoluntarioFuncaoStatusEnum.Ativo,
          experiencia: f.experiencia || EscalaTemplateExperienciaEnum.Iniciante,
        })) as UpdateFuncaoDataDto[],
      });

      Toast.show({
        type: 'success',
        text1: 'Integrante adicionado com sucesso!',
      });

      router.back();
    },
    errors => console.log('errors', errors)
  );

  if (isLoadingVoluntarios || isLoadingFuncoes || isLoadingVoluntarioFuncoes || isUpdatingFuncoes)
    return <FancyLoading />;

  return (
    <FancyPageView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 10, gap: 40 }}>
      <FormProvider {...form}>
        <IntegranteFormFields
          mode="edit"
          voluntariosDropDownList={voluntariosDropDownList}
          funcoesDropDownList={funcoesDropDownList}
          funcoesList={funcoesList}
        />
      </FormProvider>
      <FancyButton
        label={isUpdatingFuncoes ? 'Salvando...' : 'Salvar'}
        disabled={isUpdatingFuncoes}
        onPress={handleSave}
      />
    </FancyPageView>
  );
}
