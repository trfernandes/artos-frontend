import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyText from '../../../../FancyText';
import FancyContainer from '../../../../FancyContainer';
import FancyBaseCard from '../../../../cards/Horizontal/FancyBaseCard';
import { FancyActionButtons } from '../../../../cards/Horizontal/FancyCardActionButtons';
import FancyColorPicker from '../../../../FancyColorPicker';
import { useRepertorioEtiquetas } from '../../../../../hooks/useRepertorio';
import { DefaultIconsNames } from '../../../../../constants/icons';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListEmpty from '../../../../list/FancyListEmpty';

const CORES_PADRAO = [
  '#FF8C00',
  '#FFA726',
  '#E57373',
  '#EF5350',
  '#81C784',
  '#66BB6A',
  '#64B5F6',
  '#42A5F5',
  '#F48FB1',
  '#BA68C8',
  '#9575CD',
  '#7E57C2',
  '#6B7280',
  '#3B82F6',
  '#10B981',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  ministerioId?: string;
};

export default function RepertorioEtiquetasManagerSheet({ visible, onClose, ministerioId }: Props) {
  const palette = usePallete();
  const {
    data = [],
    criarEtiqueta,
    atualizarEtiqueta,
    removerEtiqueta,
    isMutatingEtiqueta,
  } = useRepertorioEtiquetas(ministerioId);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES_PADRAO[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCor, setEditingCor] = useState(CORES_PADRAO[0]);

  const etiquetasAtivas = useMemo(() => data.filter((item) => item.ativo !== false), [data]);
  const canCreateEtiqueta = nome.trim().length > 0;

  useEffect(() => {
    if (!editingId) return;
    const selected = etiquetasAtivas.find((item) => item.id === editingId);
    if (!selected) {
      setEditingId(null);
      setEditingName('');
    }
  }, [etiquetasAtivas, editingId]);

  const handleCreate = async () => {
    if (!nome.trim()) return;
    try {
      await criarEtiqueta({ nome: nome.trim(), cor });
      setNome('');
      setCor(CORES_PADRAO[0]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar etiqueta',
        text2: getApiErrorMessage(error, 'Não foi possível salvar a etiqueta.'),
      });
    }
  };

  const handleRename = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      await atualizarEtiqueta({
        id: editingId,
        dto: { nome: editingName.trim(), cor: editingCor },
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar etiqueta',
        text2: getApiErrorMessage(error, 'Não foi possível atualizar a etiqueta.'),
      });
    }
  };

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title='Etiquetas do repertório'>
      <View style={styles.sheetContent}>
        <FancyContainer
          title='Nova etiqueta'
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'tag-plus-outline',
            size: 16,
            color: palette.primary,
          }}
          headerContainerStyle={styles.composerHeader}
        >
          <View style={styles.composerBody}>
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
              Crie etiquetas coloridas para organizar as músicas.
            </FancyText>
            <View style={styles.composerInputRow}>
              <FancyTextInput
                label='Nome'
                value={nome}
                containerStyle={styles.composerInput}
                inputProps={{
                  onChangeText: setNome,
                  placeholder: 'Ex: Celebração',
                  returnKeyType: 'done',
                  onSubmitEditing: () => void handleCreate(),
                }}
              />
              <FancyButton
                type='contained'
                mode='icon'
                size={{ w: 46, h: 46 }}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'plus',
                  size: 24,
                  color: palette.fonts.light,
                }}
                isLoading={isMutatingEtiqueta}
                onPress={() => void handleCreate()}
                disabled={!canCreateEtiqueta}
                accessibilityLabel='Adicionar etiqueta'
                containerStyle={styles.composerAddButton}
              />
            </View>
            <FancyColorPicker
              value={cor}
              colors={CORES_PADRAO}
              circleSize={26}
              horizontal
              onSelectColor={setCor}
            />
          </View>
        </FancyContainer>

        <FancyContainer
          title={
            <View style={styles.listHeader}>
              <FancyText size='medium' type='bold' style={styles.listHeaderTitle}>
                Etiquetas cadastradas
              </FancyText>
              <FancyText
                size='extraSmall'
                type='medium'
                color={palette.fonts.inactive}
                style={styles.listCount}
              >
                {`${etiquetasAtivas.length} ${etiquetasAtivas.length === 1 ? 'item' : 'itens'}`}
              </FancyText>
            </View>
          }
        >
          <View style={styles.listBody}>
            {etiquetasAtivas.length === 0 ? (
              <FancyListEmpty
                label='Nenhuma etiqueta cadastrada.'
                helperText='Adicione a primeira etiqueta para começar a organizar o repertório.'
                icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 54 }}
              />
            ) : (
              <View style={styles.cardsList}>
                {etiquetasAtivas.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <FancyBaseCard
                      key={item.id}
                      containerStyle={styles.categoryCard}
                      contentContainerStyle={styles.categoryCardContent}
                      title={
                        isEditing ? (
                          <View style={styles.editingBody}>
                            <FancyTextInput
                              label='Editar nome'
                              value={editingName}
                              containerStyle={styles.editingInput}
                              inputProps={{ onChangeText: setEditingName }}
                            />
                            <FancyColorPicker
                              value={editingCor}
                              colors={CORES_PADRAO}
                              circleSize={22}
                              horizontal
                              onSelectColor={setEditingCor}
                            />
                          </View>
                        ) : (
                          <View style={styles.categoryTitleRow}>
                            <View style={[styles.categoryIcon, { backgroundColor: item.cor }]} />
                            <FancyText
                              size='small'
                              type='semiBold'
                              style={styles.categoryName}
                              numberOfLines={1}
                            >
                              {item.nome}
                            </FancyText>
                          </View>
                        )
                      }
                      rightItem={
                        isEditing ? (
                          <View style={styles.cardActions}>
                            <FancyButton
                              type='text'
                              mode='icon'
                              size={32}
                              icon={{ library: 'Feather', name: 'x', size: 16 }}
                              onPress={() => {
                                setEditingId(null);
                                setEditingName('');
                              }}
                              accessibilityLabel='Cancelar edição'
                            />
                            <FancyButton
                              type='contained'
                              mode='icon'
                              size={32}
                              icon={{ library: 'Feather', name: 'check', size: 16 }}
                              isLoading={isMutatingEtiqueta}
                              onPress={() => void handleRename()}
                              accessibilityLabel='Salvar etiqueta'
                            />
                          </View>
                        ) : (
                          <FancyActionButtons
                            containerStyle={styles.categoryActionButtons}
                            actions={[
                              {
                                size: 'small',
                                icon: { ...DefaultIconsNames.edit, size: 15 },
                                onPress: () => {
                                  setEditingId(item.id);
                                  setEditingName(item.nome);
                                  setEditingCor(item.cor);
                                },
                              },
                              {
                                size: 'small',
                                icon: {
                                  library: 'MaterialCommunityIcons',
                                  name: 'archive',
                                  size: 15,
                                  backgroundColor: palette.error,
                                },
                                onPress: () => void removerEtiqueta(item.id),
                              },
                            ]}
                          />
                        )
                      }
                    />
                  );
                })}
              </View>
            )}
          </View>
        </FancyContainer>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    gap: 14,
  },
  composerHeader: {
    paddingBottom: 3,
  },
  composerBody: {
    paddingHorizontal: 14,
    paddingBottom: 13,
    gap: 7,
  },
  composerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  composerInput: {
    flex: 1,
  },
  composerAddButton: {
    flexShrink: 0,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    flex: 1,
  },
  listHeaderTitle: {
    flex: 1,
    flexShrink: 1,
  },
  listCount: {
    flexShrink: 0,
  },
  listBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  cardsList: {
    gap: 7,
  },
  categoryCard: {
    minHeight: 50,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  categoryCardContent: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 0,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 28,
  },
  categoryName: {
    flex: 1,
    opacity: 0.82,
  },
  categoryIcon: {
    width: 18,
    height: 18,
    borderRadius: 999,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryActionButtons: {
    marginRight: 0,
  },
  editingBody: {
    flex: 1,
    gap: 6,
  },
  editingInput: {
    width: '100%',
  },
});
