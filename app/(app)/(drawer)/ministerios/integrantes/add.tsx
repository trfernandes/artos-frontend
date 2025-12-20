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
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/models/MinisterioVoluntarioFuncao';
import { EscalaTemplateExperienciaEnum } from '../../../../../domain/models/EscalaTemplate';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { HierarquiaEnum, MinisterioVoluntarioStatusEnum } from '../../../../../domain/models/MinisterioVoluntario';
import Toast from 'react-native-toast-message';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useMemo } from 'react';
import { DropDownItemProps } from '../../../../../components/fields/FancyDropDownItem';
import { DynamicQuery, OrderDirection } from '../../../../../domain/utils/query_utils';

export default function MinisterioIntegrantesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const form = useForm({ resolver: zodResolver(minVoluntarioSchema) });

  const initialParams = useMemo(() => {
    return {
      relations: ['ministerios.ministerio'],
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: voluntariosData, isLoading: isLoadingVoluntarios } = useVoluntariosCrud({
    autoFetch: true,
    initialParams,
  });

  const voluntariosDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    return voluntariosData
      .filter(v => !v.ministerios?.some(m => m.ministerio?.id === ministerioId) || !v.ministerios)
      .map(voluntario => ({
        title: voluntario?.nome,
        value: voluntario?.id,
        left: voluntario?.foto
          ? { type: 'image', source: voluntario.foto }
          : { source: require('../../../../../assets/images/empty_profile_image.png') },
      })) as DropDownItemProps<string>[];
  }, [voluntariosData, ministerioId]);

  const { funcoesList, funcoesDropDownList, isLoading: isLoadingFuncoes } = useFuncoesDoMinisterio(ministerioId);

  const { add: addVoluntario } = useMinisterioVoluntariosCrud();
  const { add: addFuncaoVoluntario } = useMinisterioVoluntarioFuncoesCrud();

  const handleSave = form.handleSubmit(
    data => {
      data.funcoes?.forEach(async f => {
        const ministerioFuncao = funcoesList.find(funcao => funcao.id === f.id);
        if (!ministerioFuncao) return;

        let voluntario = await addVoluntario({
          ministerioId: ministerioId,
          voluntarioId: data.voluntarioId,
          hierarquia: HierarquiaEnum.Voluntario,
          status: MinisterioVoluntarioStatusEnum.Ativo,
          dataInicio: new Date(),
        });

        await addFuncaoVoluntario({
          ministerioVoluntarioId: voluntario?.id!,
          funcaoId: f.id,
          experiencia: f.experiencia || EscalaTemplateExperienciaEnum.Iniciante,
          status: MinisterioVoluntarioFuncaoStatusEnum.Ativo,
        });

        Toast.show({
          type: 'success',
          text1: 'Integrante adicionado com sucesso!',
        });

        router.back();
      });
    },
    errors => console.log(errors)
  );

  if (isLoadingVoluntarios || isLoadingFuncoes) return <FancyLoading />;

  return (
    <FancyPageView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 15, gap: 40 }}>
      <FormProvider {...form}>
        <IntegranteFormFields
          mode="add"
          voluntariosDropDownList={voluntariosDropDownList}
          funcoesDropDownList={funcoesDropDownList}
          funcoesList={funcoesList}
        />
      </FormProvider>
      <FancyButton label="Salvar" onPress={handleSave} />
    </FancyPageView>
  );
}
