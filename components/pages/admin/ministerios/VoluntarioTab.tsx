import { View } from 'react-native';
import FancyList from '../../../list/FancyList';
import { Pallete } from '../../../../constants/colors';
import {
    VoluntarioHierarquiaEnum,
    VoluntarioHierarquiaEnumLabel,
    VoluntarioHierarquiaEnumMap,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { FancyActionButtons } from '../../../cards/Horizontal/FancyCardActionButtons';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyLoading from '../../../FancyLoading';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { useMinisterioVoluntariosCrud } from '../../../../hooks/useMinisterioVoluntariosCrud';
import { useCallback, useMemo, useState } from 'react';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import VoluntarioEditFormModal from './VoluntarioEditFormModal';
import FancyFab from '../../../buttons/FancyFab';
import VoluntarioAddFormModal from './VoluntarioAddFormModal';
import { useLoading } from '../../../../contexts/LoadingContext';
import { FancyCardImageProps } from '../../../cards/Horizontal/FancyCardImage';
import { ColorUtils } from '../../../../utils/color_utils';
import { AddMinisterioVoluntarioFormData, EditMinisterioVoluntarioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { AppImages } from '../../../../assets/app_images';
import { FancyAlert } from '../../../modal/FancyAlert';

export type VoluntarioTabProps = {
  ministerioId: string;
};

export default function VoluntarioTab({ ministerioId }: VoluntarioTabProps) {
  const searchParams = useMemo<DynamicQuery>(() => {
    return {
      where: { conditions: [{ path: 'ministerioId', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: ministerioId } }] },
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

  const { showLoading, hideLoading } = useLoading();

  const handleAddVoluntario = useCallback(
    async (data: AddMinisterioVoluntarioFormData) => {
      console.log('Adicionando voluntario', data);
      showLoading('Salvando...');
      try {
        await addVoluntario({
          ministerioId: ministerioId,
          voluntarioId: data.voluntarioId,
          hierarquia: VoluntarioHierarquiaEnumMap[data.hierarquia],
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
          data: { hierarquia: VoluntarioHierarquiaEnumMap[data.hierarquia] },
        });
      } finally {
        hideLoading();
      }
    },
    [updateVoluntario, showLoading, hideLoading],
  );

  const handleRemoveVoluntario = useCallback(
    (id: string) => {
      FancyAlert.alert('Exclusão', 'Tem certeza que deseja remover este voluntário do ministério?', [
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
      ]);
    },
    [FancyAlert.alert, removeVoluntario, showLoading, hideLoading],
  );

  if (isLoading) return <FancyLoading />;

  return (
    <View style={{ flex: 1 }}>
      <FancyList
        data={minVoluntsList}
        bottomSpace={45}
        containerStyle={{ flex: 1 }}
        listEmptyProps={{ label: 'Nenhum voluntário adicionado', icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 55 } }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const commonProps: FancyCardImageProps = {
            backgroundColor: [VoluntarioHierarquiaEnum.Lider, VoluntarioHierarquiaEnum.Auxiliar].includes(
              VoluntarioHierarquiaEnumMap[item.hierarquia],
            )
              ? ColorUtils.lightenColor(Pallete.primary, 0.8)
              : undefined,
            title: item.voluntario?.nome,
            subtitle: <FancyTextDisplayCard title='Função:' value={VoluntarioHierarquiaEnumLabel[item.hierarquia]} />,
            source:
              item.voluntario?.fotoUrl || item.voluntario?.fotoThumbUrl
                ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl }
                : AppImages.emptyProfile,
            actionButtons: (
              <FancyActionButtons
                actions={[
                  {
                    icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                    onPress: () => {
                      setEditFormVisible(true);
                      setEditFormParams({
                        mode: 'edit',
                        visible: true,
                        data: {
                          id: item.id,
                          voluntarioId: item.voluntarioId,
                          voluntarioNome: item.voluntario?.nome!,
                          hierarquia: item.hierarquia,
                          fotoUrl: item.voluntario?.fotoUrl || null,
                          fotoThumbUrl: item.voluntario?.fotoThumbUrl || null,
                        },
                      });
                    },
                  },
                  {
                    icon: {
                      library: 'MaterialIcons',
                      name: 'delete',
                      size: 18,
                      backgroundColor: Pallete.error,
                    },
                    onPress: () => {
                      handleRemoveVoluntario(item.id);
                    },
                  },
                ]}
              />
            ),
          };
          return <FancyCard.Image key={item.id} type={'image'} props={commonProps} />;
        }}
      />
      <FancyFab
        right={0}
        onPress={() => {
          setAddFormParams({ visible: true });
        }}
      />
      {editFormVisible && (
        <VoluntarioEditFormModal
          ministerioId={ministerioId}
          data={editFormParams?.data!}
          modalProps={{ visible: true }}
          onButton1Press={() => {
            setEditFormVisible(false);
            hideLoading();
          }}
          onButton2Press={(data) => {
            data && handleEditVoluntario(data);
            setEditFormVisible(false);
          }}
        />
      )}
      {addFormParams.visible && (
        <VoluntarioAddFormModal
          ministerioId={ministerioId}
          existingVoluntarios={minVoluntsList.map((mv) => mv.voluntarioId)}
          modalProps={{ visible: true }}
          onButton1Press={() => {
            setAddFormParams({ visible: false });
            hideLoading();
          }}
          onButton2Press={(data) => {
            data && handleAddVoluntario(data);
            setAddFormParams({ visible: false });
          }}
        />
      )}
    </View>
  );
}
