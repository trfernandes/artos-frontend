import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyText from '../../../../FancyText';
import { useRepertorioCategorias } from '../../../../../hooks/useRepertorio';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyContainer from '../../../../FancyContainer';
import FancyListEmpty from '../../../../list/FancyListEmpty';
import DefaultIcons from '../../../../FancyIcons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function RepertorioCategoriasManagerSheet({ visible, onClose }: Props) {
  const palette = usePallete();
  const { data = [], criarCategoria, atualizarCategoria, removerCategoria, isMutatingCategoria } = useRepertorioCategorias();
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const categoriasAtivas = useMemo(() => data.filter((item) => item.ativo !== false), [data]);

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
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Categorias do repertório'
    >
      <FancyContainer
        title='Nova categoria'
        containerStyle={styles.composerContainer}
      >
        <View style={styles.composerContent}>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            Crie grupos para organizar o repertório do ministério.
          </FancyText>
          <View style={styles.composerRow}>
            <FancyTextInput
              label='Nome'
              value={nome}
              containerStyle={styles.composerInput}
              inputProps={{ onChangeText: setNome }}
            />
            <FancyButton
              label='Adicionar'
              containerStyle={styles.addButton}
              isLoading={isMutatingCategoria}
              onPress={() => void handleCreate()}
            />
          </View>
        </View>
      </FancyContainer>

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <FancyText size='small' type='bold'>
            Categorias cadastradas
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            {`${categoriasAtivas.length} item${categoriasAtivas.length === 1 ? '' : 's'}`}
          </FancyText>
        </View>

        {categoriasAtivas.length === 0 ? (
          <FancyListEmpty
            label='Nenhuma categoria cadastrada.'
            helperText='Adicione a primeira categoria para começar a organizar o repertório.'
            icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 54 }}
          />
        ) : (
          <View style={styles.listContent}>
            {categoriasAtivas.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.categoryRow,
                    {
                      borderColor: palette.borderCard,
                      backgroundColor: palette.backgroundColor,
                    },
                  ]}
                >
                  {isEditing ? (
                    <FancyTextInput
                      label='Editar nome'
                      value={editingName}
                      containerStyle={styles.categoryInput}
                      inputProps={{ onChangeText: setEditingName }}
                    />
                  ) : (
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: palette.primary },
                        ]}
                      />
                      <FancyText size='small' type='semiBold'>
                        {item.nome}
                      </FancyText>
                    </View>
                  )}

                  <View style={styles.actionsRow}>
                    {isEditing ? (
                      <>
                        <FancyButton type='contained' label='Salvar' containerStyle={styles.actionButton} onPress={() => void handleRename()} />
                        <FancyButton
                          type='light'
                          label='Cancelar'
                          containerStyle={styles.actionButton}
                          onPress={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <FancyButton
                          type='light'
                          label='Editar'
                          icon={{ library: 'Feather', name: 'edit-2', size: 14 }}
                          containerStyle={styles.actionButton}
                          onPress={() => {
                            setEditingId(item.id);
                            setEditingName(item.nome);
                          }}
                        />
                        <FancyButton
                          type='text'
                          label='Arquivar'
                          labelStyle={{ color: palette.error }}
                          icon={{ library: 'Feather', name: 'trash-2', size: 14, color: palette.error }}
                          containerStyle={styles.archiveButton}
                          onPress={() => {
                            void removerCategoria(item.id);
                          }}
                        />
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  composerContainer: {
    paddingBottom: 14,
  },
  composerContent: {
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 2,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  composerInput: {
    flex: 1,
  },
  addButton: {
    minWidth: 110,
    height: 44,
  },
  listSection: {
    gap: 14,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listContent: {
    gap: 10,
  },
  categoryRow: {
    borderWidth: 0.6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 22,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  categoryInput: {
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 92,
    height: 34,
  },
  archiveButton: {
    minWidth: 0,
    height: 30,
    paddingHorizontal: 0,
    gap: 6,
  },
});
