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
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { VoluntariosRepository } from '../../../../../domain/services/VoluntariosRepository';
import { MinisterioAddFormData } from '../../../../../components/pages/admin/voluntarios/MinisterioAddForm';
import { ResponseMinisterioVoluntarioDto } from '../../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { MinisterioVoluntarioStatusEnum } from '../../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { ResponseVoluntarioDto } from '../../../../../domain/dtos/Voluntario/voluntario.response';
import { useFocusEffect } from 'expo-router';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { IgrejaRepository } from '../../../../../domain/services/IgrejaRepository';
import { IgrejaVoluntarioRoleEnum } from '../../../../../domain/enums/Igreja/voluntario-role.enum';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import Toast from 'react-native-toast-message';

export default function VoluntariosDetailsPage() {
  const parametros = useLocalSearchParams<{
    id: string;
  }>();

  const { showLoading, hideLoading } = useLoading();
  const { igrejaAtiva } = useAuth();

  useFocusEffect(() => {
    hideLoading();
  });

  const searchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: parametros.id },
          },
        ],
      },
      relations: ['ministerios', 'ministerios.historico', 'ministerios.ministerio'],
    };
  }, [parametros.id]);

  const [voluntarioData, setVoluntarioData] = useState<ResponseVoluntarioDto[] | undefined>();
  const [isLoadingVoluntarios, setIsLoadingVoluntarios] = useState(false);

  const loadData = useCallback(() => {
    setIsLoadingVoluntarios(true);
    VoluntariosRepository.search(searchParams)
      .then((data) => {
        if (__DEV__) {
          console.log('[Admin/Voluntarios] Data loaded:', data.length, 'voluntarios');
        }
        setVoluntarioData(data);
      })
      .finally(() => {
        setIsLoadingVoluntarios(false);
      });
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [membroRole, setMembroRole] = useState<IgrejaVoluntarioRoleEnum | undefined>();
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  const loadRole = useCallback(() => {
    if (!igrejaAtiva) return;
    setIsLoadingRole(true);
    IgrejaRepository.listarVoluntarios(igrejaAtiva.id, {
      where: {
        conditions: [
          {
            path: 'voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: parametros.id },
          },
        ],
      },
    })
      .then((data) => {
        setMembroRole(data[0]?.role);
      })
      .finally(() => {
        setIsLoadingRole(false);
      });
  }, [igrejaAtiva, parametros.id]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  const isViewerAdmin = igrejaAtiva?.role === IgrejaVoluntarioRoleEnum.ADMIN;

  const handleChangeRole = useCallback(
    async (novaRole: IgrejaVoluntarioRoleEnum) => {
      if (!igrejaAtiva || !parametros.id || novaRole === membroRole) return;
      showLoading('Alterando função...');
      try {
        await IgrejaRepository.alterarRoleVoluntario(igrejaAtiva.id, parametros.id, {
          role: novaRole,
        });
        setMembroRole(novaRole);
        Toast.show({ text1: 'Função alterada com sucesso!', type: 'success' });
      } catch (error) {
        Toast.show({
          text1: getApiErrorMessage(error, 'Erro ao alterar função.'),
          type: 'error',
        });
      } finally {
        hideLoading();
      }
    },
    [igrejaAtiva, parametros.id, membroRole, showLoading, hideLoading],
  );

  const {
    add: addVoluntarioMinisterio,
    update: updateVoluntarioMinisterio,
    isLoadingMutation: isLoadingRemoveVoluntarioMinisterio,
  } = useMinisterioVoluntariosCrud({
    autoFetch: false,
  });

  const handleChangeStatus = useCallback(
    (
      ministerioVoluntario: ResponseMinisterioVoluntarioDto,
      status: MinisterioVoluntarioStatusEnum,
    ) => {
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
              await updateVoluntarioMinisterio?.({
                id: ministerioVoluntario.id!,
                data: {
                  status,
                },
              });

              loadData();
            },
          },
        ],
      );
    },
    [updateVoluntarioMinisterio, loadData],
  );

  const handleAddMinisterio = useCallback(
    async (data: MinisterioAddFormData) => {
      await addVoluntarioMinisterio?.({
        voluntarioId: parametros.id,
        ministerioId: data.ministerioId,
        hierarquia: data.hierarquia,
      } as any);

      loadData();
    },
    [addVoluntarioMinisterio, parametros.id],
  );

  const handleUpdateMinisterio = useCallback(
    async (data: MinisterioAddFormData) => {
      await updateVoluntarioMinisterio?.({
        id: data.ministerioVoluntarioId!,
        data: {
          hierarquia: data.hierarquia,
        },
      });

      loadData();
    },
    [updateVoluntarioMinisterio, parametros.id],
  );

  const TAB_DATA: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info, size: 16 },
        content: (
          <VoluntarioDadosTab
            voluntario={voluntarioData?.[0]!}
            role={membroRole}
            isLoadingRole={isLoadingRole}
            canChangeRole={isViewerAdmin}
            onChangeRole={handleChangeRole}
          />
        ),
      },
      {
        title: 'Ministérios',
        icon: { library: 'Feather', name: 'grid', size: 15 },
        content: (
          <VoluntarioMinisterioTab
            mode='view'
            onAdd={handleAddMinisterio}
            onUpdate={handleUpdateMinisterio}
            ministerios={voluntarioData?.[0]?.ministerios}
            onEnable={(ministerioVoluntario) => {
              handleChangeStatus(ministerioVoluntario, MinisterioVoluntarioStatusEnum.Ativo);
            }}
            onDisabled={(ministerioVoluntario) => {
              handleChangeStatus(ministerioVoluntario, MinisterioVoluntarioStatusEnum.Inativo);
            }}
          />
        ),
      },
    ],
    [
      voluntarioData,
      handleAddMinisterio,
      handleUpdateMinisterio,
      handleChangeStatus,
      membroRole,
      isLoadingRole,
      isViewerAdmin,
      handleChangeRole,
    ],
  );

  if (isLoadingRemoveVoluntarioMinisterio || isLoadingVoluntarios) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={TAB_DATA} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 8 },
});
