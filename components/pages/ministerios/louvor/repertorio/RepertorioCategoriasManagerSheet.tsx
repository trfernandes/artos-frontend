import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyText from '../../../../FancyText';
import FancyContainer from '../../../../FancyContainer';
import FancyBaseCard from '../../../../cards/Horizontal/FancyBaseCard';
import { FancyActionButtons } from '../../../../cards/Horizontal/FancyCardActionButtons';
import DefaultIcons from '../../../../FancyIcons';
import { useRepertorioCategorias } from '../../../../../hooks/useRepertorio';
import { DefaultIconsNames } from '../../../../../constants/icons';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListEmpty from '../../../../list/FancyListEmpty';

type Props = {
  visible: boolean;
  onClose: () => void;
  ministerioId?: string;
};

export default function RepertorioCategoriasManagerSheet({
  visible,
  onClose,
  ministerioId,
}: Props) {
  const palette = usePallete();
  const {
    data = [],
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    isMutatingCategoria,
  } = useRepertorioCategorias(ministerioId);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const categoriasAtivas = useMemo(() => data.filter((item) => item.ativo !== false), [data]);
  const canCreateCategoria = nome.trim().length > 0;

  useEffect(() => {
    if (!editingId) return;
    const selected = categoriasAtivas.find((item) => item.id === editingId);
    if (!selected) {
      setEditingId(null);
      setEditingName('');
    }
  }, [categoriasAtivas, editingId]);

  const handleCreate = async () => {
    if (!nome.trim()) return;
    try {
      await criarCategoria({ nome: nome.trim() });
      setNome('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar categoria',
        text2: getApiErrorMessage(error, 'Não foi possível salvar a categoria.'),
      });
    }
  };

  const handleRename = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      await atualizarCategoria({ id: editingId, dto: { nome: editingName.trim() } });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar categoria',
        text2: getApiErrorMessage(error, 'Não foi possível atualizar a categoria.'),
      });
    }
  };

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title='Categorias do repertório'>
      <View style={styles.sheetContent}>
        <FancyContainer
          title='Nova categoria'
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
              Crie grupos para organizar as músicas.
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
                isLoading={isMutatingCategoria}
                onPress={() => void handleCreate()}
                disabled={!canCreateCategoria}
                accessibilityLabel='Adicionar categoria'
                containerStyle={styles.composerAddButton}
              />
            </View>
          </View>
        </FancyContainer>

        <FancyContainer
          title={
            <View style={styles.listHeader}>
              <FancyText size='medium' type='bold' style={styles.listHeaderTitle}>
                Categorias cadastradas
              </FancyText>
              <FancyText
                size='extraSmall'
                type='medium'
                color={palette.fonts.inactive}
                style={styles.listCount}
              >
                {`${categoriasAtivas.length} ${categoriasAtivas.length === 1 ? 'item' : 'itens'}`}
              </FancyText>
            </View>
          }
        >
          <View style={styles.listBody}>
            {categoriasAtivas.length === 0 ? (
              <FancyListEmpty
                label='Nenhuma categoria cadastrada.'
                helperText='Adicione a primeira categoria para começar a organizar o repertório.'
                icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 54 }}
              />
            ) : (
              <View style={styles.cardsList}>
                {categoriasAtivas.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <FancyBaseCard
                      key={item.id}
                      containerStyle={styles.categoryCard}
                      contentContainerStyle={styles.categoryCardContent}
                      title={
                        isEditing ? (
                          <View style={styles.editingInputWrap}>
                            <FancyTextInput
                              label='Editar nome'
                              value={editingName}
                              containerStyle={styles.editingInput}
                              inputProps={{ onChangeText: setEditingName }}
                            />
                          </View>
                        ) : (
                          <View style={styles.categoryTitleRow}>
                            <View
                              style={[styles.categoryIcon, { backgroundColor: palette.primary }]}
                            >
                              <DefaultIcons.Custom
                                library='MaterialCommunityIcons'
                                name='shape-outline'
                                size={14}
                                color={palette.fonts.light}
                              />
                            </View>
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
                              isLoading={isMutatingCategoria}
                              onPress={() => void handleRename()}
                              accessibilityLabel='Salvar categoria'
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
                                onPress: () => void removerCategoria(item.id),
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
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryActionButtons: {
    marginRight: 0,
  },
  editingInputWrap: {
    flex: 1,
  },
  editingInput: {
    width: '100%',
  },
});
