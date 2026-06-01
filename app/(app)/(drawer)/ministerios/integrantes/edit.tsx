import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import {
  MinVoluntarioFormData,
  minVoluntarioSchema,
} from '../../../../../domain/schemas/ministerioVoluntariosSchema';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import IntegranteFormFields from '../../../../../components/pages/ministerios/integrantes/FormFields';
import { UpdateFuncaoDataDto } from '../../../../../domain/services/MinisterioVoluntarioFuncoesRepository';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { MinisterioVoluntarioStatusEnum } from '../../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import {
  MinisterioVoluntarioFuncaoStatusEnum,
  MinisterioVoluntarioFuncaoStatusEnumMap,
} from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaEnumMap,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { useMinisterioVoluntarioFuncoesCrud } from '../../../../../hooks/useMinisterioVoluntarioFuncoesCrud';
import { ResponseMinisterioFuncaoDto } from '../../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';

export default function MinisterioIntegrantesEditPage() {
  const params = useLocalSearchParams<{
    ministerioId: string;
    ministerioVoluntarioId: string;
  }>();

  const { hideLoading } = useLoading();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<MinVoluntarioFormData>({
    resolver: zodResolver(minVoluntarioSchema),
    defaultValues: {
      voluntarioId: '',
      funcoes: [],
    },
  });

  useFocusEffect(() => {
    hideLoading();
  });

  const voluntarioSearchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: params.ministerioVoluntarioId },
          },
        ],
      },
      relations: ['voluntario'],
      orderBy: [
        {
          path: 'voluntario.nome',
          direction: OrderDirection.ASC,
        },
      ],
    } as DynamicQuery;
  }, [params]);

  const { data, isLoading: isLoadingVoluntario } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams: voluntarioSearchParams,
  });

  const voluntarioAtual = useMemo(() => (data && data.length > 0 ? data[0] : null), [data]);

  const funcoesSearchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'ministerioVoluntarioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: params.ministerioVoluntarioId },
          },
        ],
      },
      relations: ['funcao'],
      orderBy: [
        {
          path: 'funcao.nome',
          direction: OrderDirection.ASC,
        },
      ],
    } as DynamicQuery;
  }, [params.ministerioVoluntarioId]);

  const {
    data: funcoesData,
    updateFuncoes,
    isUpdatingFuncoes,
    isLoading: isLoadingFuncoes,
    isLoadingMutation: isUpdatingFuncoesMutation,
  } = useMinisterioVoluntarioFuncoesCrud({ autoFetch: true, initialParams: funcoesSearchParams });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!voluntarioAtual || isLoadingFuncoes || hasInitialized.current) return;

    const funcoes = funcoesData?.map((f) => ({
      id: f.funcao?.id,
      nome: f.funcao?.nome || '',
      status:
        MinisterioVoluntarioFuncaoStatusEnumMap[f.status] ||
        MinisterioVoluntarioFuncaoStatusEnum.Ativo,
      experiencia:
        EscalaTemplateExperienciaEnumMap[f.experiencia] || EscalaTemplateExperienciaEnum.Iniciante,
    }));

    form.reset({
      voluntarioId: voluntarioAtual.id || '',
      voluntarioFoto: voluntarioAtual.voluntario?.fotoThumbUrl || '',
      voluntarioNome: voluntarioAtual.voluntario?.nome || '',
      voluntarioEmail: voluntarioAtual.voluntario?.email || '',
      voluntarioStatus: voluntarioAtual.status || MinisterioVoluntarioStatusEnum.Ativo,
      funcoes,
    });

    hasInitialized.current = true;
  }, [voluntarioAtual, funcoesData, isLoadingFuncoes]);

  const handleSave = form.handleSubmit(
    async (data) => {
      setIsSaving(true);
      try {
        await updateFuncoes(params.ministerioVoluntarioId, {
          funcoes: data.funcoes?.map((f) => ({
            funcaoId: f.id,
            status: MinisterioVoluntarioFuncaoStatusEnum.Ativo,
            experiencia: f.experiencia || EscalaTemplateExperienciaEnum.Iniciante,
          })) as UpdateFuncaoDataDto[],
        });
        router.back();
      } finally {
        setIsSaving(false);
      }
    },
    (errors) => console.log('errors', errors),
  );

  const {
    funcoesDropDownList,
    funcoesList,
    isLoading: isLoadingFuncoesList,
  } = useFuncoesDoMinisterio(params.ministerioId);

  const voluntarioFuncoesList = useMemo<ResponseMinisterioFuncaoDto[]>(() => {
    const data = form.getValues('funcoes');

    // console.log('Dados: ', strfyObj({ funcoesList, data }));

    return data?.map((f) => ({
      id: f.id,
      nome: funcoesList.find((funcoesListItem) => funcoesListItem.id === f.id)?.nome || '',
    })) as ResponseMinisterioFuncaoDto[];
  }, [voluntarioAtual, funcoesList, form]);

  if (isLoadingVoluntario || isLoadingFuncoesList || isLoadingFuncoes) return <FancyLoading />;

  return (
    <FancyPageView style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 12, gap: 16 }}>
      <FormProvider {...form}>
        <IntegranteFormFields
          mode='edit'
          funcoesList={funcoesList}
          funcoesDropDownList={funcoesDropDownList}
        />
      </FormProvider>
      <FancyButton
        icon={{ ...DefaultIconsNames.save, size: 14 }}
        label='Salvar'
        loadingText='Salvando...'
        isLoading={isSaving || isUpdatingFuncoes || isUpdatingFuncoesMutation}
        disabled={isSaving || isUpdatingFuncoes || isUpdatingFuncoesMutation}
        onPress={handleSave}
      />
    </FancyPageView>
  );
}
