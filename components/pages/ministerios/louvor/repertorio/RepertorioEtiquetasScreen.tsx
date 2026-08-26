import { useMemo, useState } from 'react';
import FancyListPage from '../../../base/FancyBaseListPage';
import FancyListItemCard from '../../../../cards/FancyListItemCard';
import { FancyActionButtons } from '../../../../cards/Horizontal/FancyCardActionButtons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import RepertorioEtiquetaFormSheet from './RepertorioEtiquetaFormSheet';
import { useRepertorioEtiquetas } from '../../../../../hooks/useRepertorio';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { usePallete } from '../../../../../hooks/usePallete';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { ResponseRepertorioEtiquetaDto } from '../../../../../domain/dtos/Repertorio/repertorio-etiqueta.response';
import { ColorUtils } from '../../../../../utils/color_utils';
import Toast from 'react-native-toast-message';

type Props = {
  ministerioId?: string;
};

export default function RepertorioEtiquetasScreen({ ministerioId }: Props) {
  const palette = usePallete();
  const { isDark } = useAppTheme();
  const cardBaseColor = isDark ? palette.backgroundColor2 : palette.backgroundColor;
  const { data = [], removerEtiqueta } = useRepertorioEtiquetas(ministerioId);
  const { showLoading, hideLoading } = useLoading();
  const [formVisible, setFormVisible] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState<ResponseRepertorioEtiquetaDto | null>(
    null,
  );

  const etiquetasAtivas = useMemo(() => data.filter((item) => item.ativo !== false), [data]);

  const openCreate = () => {
    setEditingEtiqueta(null);
    setFormVisible(true);
  };

  const openEdit = (item: ResponseRepertorioEtiquetaDto) => {
    setEditingEtiqueta(item);
    setFormVisible(true);
  };

  const handleRemover = (item: ResponseRepertorioEtiquetaDto) => {
    const totalMusicas = item.totalMusicas ?? 0;
    const mensagem =
      totalMusicas > 1
        ? `"${item.nome}" está vinculada a ${totalMusicas} músicas. Elas continuarão no repertório, mas perderão essa etiqueta. Deseja excluir mesmo assim?`
        : `Tem certeza que deseja excluir "${item.nome}"?`;
    FancyAlert.alert('Excluir etiqueta', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          showLoading('Excluindo...');
          try {
            await removerEtiqueta(item.id);
            Toast.show({ type: 'success', text1: 'Etiqueta excluída com sucesso!' });
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Erro ao excluir etiqueta',
              text2: getApiErrorMessage(error, 'Não foi possível excluir a etiqueta.'),
            });
          } finally {
            hideLoading();
          }
        },
      },
    ]);
  };

  return (
    <>
      <FancyListPage
        showSearchBar={false}
        fabProps={{ onPress: openCreate }}
        listProps={{
          data: etiquetasAtivas,
          listEmptyProps: {
            label: 'Nenhuma etiqueta cadastrada.',
            helperText: 'Toque no botão + para adicionar a primeira etiqueta.',
            icon: { library: 'MaterialCommunityIcons', name: 'shape-outline', size: 54 },
          },
          renderItem: ({ item }) => {
            const totalMusicas = item.totalMusicas ?? 0;
            const subtitleLabel = totalMusicas === 1 ? '1 música' : `${totalMusicas} músicas`;
            return (
              <FancyListItemCard
                onPress={() => openEdit(item)}
                accessibilityLabel={`Editar etiqueta ${item.nome}`}
                containerStyle={{
                  backgroundColor: ColorUtils.blendOver(item.cor, 0.12, cardBaseColor),
                  minHeight: 60,
                  paddingVertical: 8,
                }}
                title={item.nome}
                subtitle={subtitleLabel}
                subtitleProps={{ size: 10 }}
                contentStyle={{ gap: 0 }}
                leading={{
                  type: 'icon',
                  icon: { library: 'MaterialCommunityIcons', name: 'tag-outline', size: 20 },
                  color: item.cor,
                  backgroundColor: ColorUtils.blendOver(item.cor, 0.22, cardBaseColor),
                  size: 36,
                }}
                trailing={
                  <FancyActionButtons
                    actions={[
                      {
                        icon: {
                          library: 'MaterialCommunityIcons',
                          name: 'trash-can-outline',
                          size: 19,
                          backgroundColor: palette.error,
                          color: palette.icons.light,
                        },
                        onPress: () => handleRemover(item),
                      },
                    ]}
                  />
                }
              />
            );
          },
        }}
      />

      <RepertorioEtiquetaFormSheet
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        ministerioId={ministerioId}
        etiqueta={editingEtiqueta}
      />
    </>
  );
}
