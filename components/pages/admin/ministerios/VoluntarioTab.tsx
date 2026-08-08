import { StyleSheet, View } from 'react-native';
import FancyList from '../../../list/FancyList';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancyListItemCard from '../../../cards/FancyListItemCard';
import FancyChips from '../../../FancyChips';
import FancyActionSheet from '../../../actions/FancyActionSheet';
import { usePallete } from '../../../../hooks/usePallete';
import {
  VoluntarioHierarquiaEnum,
  VoluntarioHierarquiaEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import FancyLoading from '../../../FancyLoading';
import { useMinisterioVoluntariosCrud } from '../../../../hooks/useMinisterioVoluntariosCrud';
import { useCallback, useMemo, useState } from 'react';
import {
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../domain/utils/query_utils';
import VoluntarioEditFormModal from './VoluntarioEditFormModal';
import VoluntarioAddFormModal from './VoluntarioAddFormModal';
import { useLoading } from '../../../../contexts/LoadingContext';
import { DefaultIconsNames } from '../../../../constants/icons';
import {
  AddMinisterioVoluntarioFormData,
  EditMinisterioVoluntarioFormData,
} from '../../../../domain/schemas/ministerioAdminSchema';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { AppImages } from '../../../../assets/app_images';
import { FancyAlert } from '../../../modal/FancyAlert';
import VoluntarioSummarySheet from '../../common/VoluntarioSummarySheet';
import { MinisterioVoluntarioStatusEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';

export type VoluntarioTabProps = {
  ministerioId: string;
};

export default function VoluntarioTab({ ministerioId }: VoluntarioTabProps) {
  const Pallete = usePallete();
  const searchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'ministerioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      relations: ['voluntario'],
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
    };
  }, [ministerioId]);

  const {
    data: minVoluntsList,
    isLoading,
    update: updateVoluntario,
    add: addVoluntario,
    remove: removeVoluntario,
  } = useMinisterioVoluntariosCrud({ autoFetch: true, initialParams: searchParams });

  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormParams, setEditFormParams] = useState<{
    mode: 'edit';
    visible: true;
    data?: EditMinisterioVoluntarioFormData;
  }>();

  const [addFormParams, setAddFormParams] = useState<{ visible: boolean }>({ visible: false });
  const [selectedVoluntario, setSelectedVoluntario] = useState<any | null>(null);
  const [actionsVoluntario, setActionsVoluntario] =
    useState<ResponseMinisterioVoluntarioDto | null>(null);

  const { showLoading, hideLoading } = useLoading();

  const handleAddVoluntario = useCallback(
    async (data: AddMinisterioVoluntarioFormData) => {
      console.log('Adicionando voluntario', data);
      showLoading('Salvando...');
      try {
        await addVoluntario({
          ministerioId: ministerioId,
          voluntarioId: data.voluntarioId,
          hierarquia: data.hierarquia,
        });
      } finally {
        hideLoading();
      }
    },
    [addVoluntario, showLoading, hideLoading],
  );

  const handleEditVoluntario = useCallback(
    async (data: EditMinisterioVoluntarioFormData) => {
      showLoading('Salvando...');
      try {
        await updateVoluntario?.({
          id: data.id,
          data: { hierarquia: data.hierarquia },
        });
      } finally {
        hideLoading();
      }
    },
    [updateVoluntario, showLoading, hideLoading],
  );

  const handleRemoveVoluntario = useCallback(
    (id: string) => {
      FancyAlert.alert(
        'Exclusão',
        'Tem certeza que deseja remover este voluntário do ministério?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: async () => {
              showLoading('Removendo...');
              try {
                await removeVoluntario(id);
              } finally {
                hideLoading();
              }
            },
          },
        ],
      );
    },
    [FancyAlert.alert, removeVoluntario, showLoading, hideLoading],
  );

  const hierarquiaColor = (hierarquia: VoluntarioHierarquiaEnum) => {
    if (hierarquia === VoluntarioHierarquiaEnum.Lider) return Pallete.primary;
    if (hierarquia === VoluntarioHierarquiaEnum.Auxiliar) return Pallete.secondary;
    return Pallete.fonts.inactive;
  };

  if (isLoading) return <FancyLoading />;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <FancyText size='medium' type='bold' style={styles.headerTitle}>
          Voluntários ({minVoluntsList.length})
        </FancyText>
        <FancyButton
          mode='icon'
          type='contained'
          icon={{ ...DefaultIconsNames.add, size: 19, color: Pallete.icons.light }}
          onPress={() => setAddFormParams({ visible: true })}
          containerStyle={styles.addButton}
        />
      </View>

      <FancyList
        data={minVoluntsList}
        bottomSpace={45}
        containerStyle={{ flex: 1 }}
        listEmptyProps={{
          label: 'Nenhum voluntário adicionado',
          icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 55 },
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FancyListItemCard
            title={item.voluntario?.nome || ''}
            subtitle={item.voluntario?.email || undefined}
            leading={{
              type: 'image',
              size: 46,
              source:
                item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl
                  ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl }
                  : AppImages.emptyProfile,
            }}
            status={
              <FancyChips
                label={VoluntarioHierarquiaEnumLabel[item.hierarquia]}
                color={hierarquiaColor(item.hierarquia)}
                size='small'
              />
            }
            trailing={{ type: 'menu', onPress: () => setActionsVoluntario(item) }}
            onPress={() =>
              setSelectedVoluntario({
                nome: item.voluntario?.nome || '-',
                email: item.voluntario?.email || null,
                telefone: item.voluntario?.telefone || null,
                fotoUrl: item.voluntario?.fotoUrl || null,
                fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                papelLabel: VoluntarioHierarquiaEnumLabel[item.hierarquia],
                statusLabel: MinisterioVoluntarioStatusEnumLabel[item.status],
              })
            }
          />
        )}
      />

      <FancyActionSheet
        visible={!!actionsVoluntario}
        onClose={() => setActionsVoluntario(null)}
        actions={[
          {
            label: 'Editar papel',
            icon: { ...DefaultIconsNames.edit, size: 18 },
            onPress: () => {
              if (!actionsVoluntario) return;
              setEditFormVisible(true);
              setEditFormParams({
                mode: 'edit',
                visible: true,
                data: {
                  id: actionsVoluntario.id,
                  voluntarioId: actionsVoluntario.voluntarioId,
                  voluntarioNome: actionsVoluntario.voluntario?.nome!,
                  hierarquia: actionsVoluntario.hierarquia,
                  fotoUrl: actionsVoluntario.voluntario?.fotoUrl || null,
                  fotoThumbUrl: actionsVoluntario.voluntario?.fotoThumbUrl || null,
                },
              });
            },
          },
          {
            label: 'Remover',
            destructive: true,
            icon: { ...DefaultIconsNames.delete, size: 18 },
            onPress: () => {
              if (actionsVoluntario) handleRemoveVoluntario(actionsVoluntario.id);
            },
          },
        ]}
      />

      {editFormParams?.data && (
        <VoluntarioEditFormModal
          visible={editFormVisible}
          data={editFormParams.data}
          onClose={() => setEditFormVisible(false)}
          onSubmit={(data) => {
            handleEditVoluntario(data);
            setEditFormVisible(false);
          }}
        />
      )}
      {addFormParams.visible && (
        <VoluntarioAddFormModal
          ministerioId={ministerioId}
          existingVoluntarios={minVoluntsList.map((mv) => mv.voluntarioId)}
          visible={addFormParams.visible}
          onClose={() => {
            setAddFormParams({ visible: false });
            hideLoading();
          }}
          onSubmit={(data) => {
            handleAddVoluntario(data);
            setAddFormParams({ visible: false });
          }}
        />
      )}
      <VoluntarioSummarySheet
        visible={!!selectedVoluntario}
        onClose={() => setSelectedVoluntario(null)}
        data={selectedVoluntario}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  headerTitle: {
    flex: 1,
    opacity: 0.7,
  },
  addButton: {
    minHeight: 25,
    height: 25,
    minWidth: 25,
    width: 25,
  },
});
