import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import VoluntarioDadosTab from '../../../../../components/pages/admin/voluntarios/DadosTab';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import VoluntarioMinisterioTab from '../../../../../components/pages/admin/voluntarios/VoluntarioMinisterioTab';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import FancyLoading from '../../../../../components/FancyLoading';
import { MinisterioVoluntarioModel, MinisterioVoluntarioStatusEnum } from '../../../../../domain/models/MinisterioVoluntario';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { VoluntarioModel } from '../../../../../domain/models/Voluntario';
import { VoluntariosRepository } from '../../../../../domain/services/VoluntariosRepository';
import { MinisterioAddFormData } from '../../../../../components/pages/admin/voluntarios/MinisterioAddForm';

export default function VoluntariosDetailsPage() {
  const parametros = useLocalSearchParams<{
    id: string;
  }>();

  const searchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [{ path: 'id', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: parametros.id } }],
      },
      relations: ['ministerios', 'ministerios.ministerio', 'ministerios.historico'],
    };
  }, [parametros.id]);

  const [voluntarioData, setVoluntarioData] = useState<VoluntarioModel[] | undefined>();
  const [isLoadingVoluntarios, setIsLoadingVoluntarios] = useState(false);

  const loadData = useCallback(() => {
    setIsLoadingVoluntarios(true);
    VoluntariosRepository.search(searchParams)
      .then(data => {
        setVoluntarioData(data);
      })
      .finally(() => {
        setIsLoadingVoluntarios(false);
      });
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    add: addVoluntarioMinisterio,
    update: updateVoluntarioMinisterio,
    isLoadingMutation: isLoadingRemoveVoluntarioMinisterio,
  } = useMinisterioVoluntariosCrud({
    autoFetch: false,
    messages: {
      successDelete: 'Ministério removido do voluntário com sucesso!',
      successCreate: 'Ministério adicionado ao voluntário com sucesso!',
      successUpdate: 'Ministério do voluntário atualizado com sucesso!',
      errorCreate: 'Erro ao adicionar ministério ao voluntário.',
      errorDelete: 'Erro ao remover ministério do voluntário.',
      errorUpdate: 'Erro ao atualizar ministério do voluntário.',
    },
  });

  const handleChangeStatus = useCallback((ministerioVoluntario: MinisterioVoluntarioModel, status: MinisterioVoluntarioStatusEnum) => {
    FancyAlert.alert(
      'Exclusão de Ministério',
      status === MinisterioVoluntarioStatusEnum.Ativo
        ? `Tem certeza que deseja "ativar" este ministério do voluntário?`
        : `Tem certeza que deseja "desativar" este ministério do voluntário?`,
      [
        {
          text: 'Não',
          style: 'destructive',
        },
        {
          text: 'Sim',
          onPress: async () => {
            await updateVoluntarioMinisterio({
              id: ministerioVoluntario.id!,
              data: {
                status,
              },
            });

            loadData();
          },
        },
      ]
    );
  }, []);

  const handleAddMinisterio = useCallback(
    async (data: MinisterioAddFormData) => {
      await addVoluntarioMinisterio({
        voluntarioId: parametros.id,
        ministerioId: data.ministerioId,
        hierarquia: data.hierarquia,
      } as any);

      loadData();
    },
    [addVoluntarioMinisterio, parametros.id]
  );

  const handleUpdateMinisterio = useCallback(
    async (data: MinisterioAddFormData) => {

      await updateVoluntarioMinisterio({
        id: data.ministerioVoluntarioId!,
        data: {
          hierarquia: data.hierarquia,
        },
      });

      loadData();
    },
    [updateVoluntarioMinisterio, parametros.id]
  );

  const TAB_DATA: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info, size: 16 },
        content: <VoluntarioDadosTab voluntario={voluntarioData?.[0]!} />,
      },
      {
        title: 'Ministérios',
        icon: { library: 'Feather', name: 'grid', size: 15 },
        content: (
          <VoluntarioMinisterioTab
            onAdd={handleAddMinisterio}
            onUpdate={handleUpdateMinisterio}
            ministerios={voluntarioData?.[0]?.ministerios}
            onEnable={ministerioVoluntario => {
              handleChangeStatus(ministerioVoluntario, MinisterioVoluntarioStatusEnum.Ativo);
            }}
            onDisabled={ministerioVoluntario => {
              handleChangeStatus(ministerioVoluntario, MinisterioVoluntarioStatusEnum.Inativo);
            }}
          />
        ),
      },
    ],
    [voluntarioData, handleChangeStatus]
  );

  if (isLoadingRemoveVoluntarioMinisterio || isLoadingVoluntarios) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_DATA}
        containerStyle={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ flex: 1, borderWidth: 0 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10,   },
});
