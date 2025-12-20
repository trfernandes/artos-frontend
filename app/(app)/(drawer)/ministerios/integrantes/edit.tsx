import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { MinVoluntarioFormData, minVoluntarioSchema } from '../../../../../domain/schemas/ministerioVoluntariosSchema';
import { router, useLocalSearchParams } from 'expo-router';
import { useMinisterioVoluntarioFuncoesCrud } from '../../../../../hooks/useMinisterioVoluntarioFuncoesCrud';
import { useEffect, useMemo } from 'react';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import FancyLoading from '../../../../../components/FancyLoading';
import IntegranteFormFields from '../../../../../components/pages/ministerios/integrantes/FormFields';
import {
  MinisterioVoluntarioFuncaoStatusEnum,
  MinisterioVoluntarioFuncaoStatusEnumMap,
} from '../../../../../domain/models/MinisterioVoluntarioFuncao';
import { EscalaTemplateExperienciaEnum, EscalaTemplateExperienciaEnumMap } from '../../../../../domain/models/EscalaTemplate';
import { UpdateFuncaoDataDto } from '../../../../../domain/services/MinisterioVoluntarioFuncoesRepository';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { MinisterioVoluntarioStatusEnum } from '../../../../../domain/models/MinisterioVoluntario';

export default function MinisterioIntegrantesEditPage() {
  const { ministerioId, ministerioVoluntarioId, voluntario } = useLocalSearchParams<{
    ministerioId: string;
    ministerioVoluntarioId: string;
    voluntario: string;
  }>();

  const voluntarioObj = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(voluntario));
    } catch {
      return null;
    }
  }, [voluntario]);

  const { voluntariosDropDownList, isLoading: isLoadingVoluntarios } = useVoluntariosDoMinisterioCrud(ministerioId);

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
    messages:{
      successUpdate: 'Voluntário atualizado com sucesso!',
      errorUpdate: 'Erro ao atualizar o voluntário.',
    }
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
      voluntarioId: voluntarioObj?.id || '',
      voluntarioFoto: voluntarioObj?.voluntario?.foto || '',
      voluntarioNome: voluntarioObj?.voluntario?.nome || '',
      voluntarioEmail: voluntarioObj?.voluntario?.email || '',
      voluntarioStatus: voluntarioObj?.status || MinisterioVoluntarioStatusEnum.Ativo,
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

      router.back();
    },
    errors => console.log('errors', errors)
  );

  if (isLoadingVoluntarios || isLoadingFuncoes || isLoadingVoluntarioFuncoes || isUpdatingFuncoes) return <FancyLoading />;

  return (
    <FancyPageView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 10, gap: 20 }}>
      <FormProvider {...form}>
        <IntegranteFormFields
          mode="edit"
          voluntariosDropDownList={voluntariosDropDownList}
          funcoesDropDownList={funcoesDropDownList}
          funcoesList={funcoesList}
        />
      </FormProvider>
      <FancyButton
        icon={{ ...DefaultIconsNames.save, size: 14 }}
        label={isUpdatingFuncoes ? 'Salvando...' : 'Salvar'}
        disabled={isUpdatingFuncoes}
        onPress={handleSave}
      />
    </FancyPageView>
  );
}
