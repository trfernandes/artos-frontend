import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyButton from '../../buttons/FancyButton';
import FancyChips from '../../FancyChips';
import DefaultIcons from '../../FancyIcons';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import EventoSetlistEditorSheet from './EventoSetlistEditorSheet';
import { getApiErrorMessage } from '../../../domain/api/api-error';
import { EventoSetlistItemOrigemEnum, ResponseEventoSetlistItemDto } from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { usePallete } from '../../../hooks/usePallete';
import { useEventoSetlist } from '../../../hooks/useEventoSetlist';
import { useEventoSetlistObservacoes } from '../../../hooks/useEventoSetlistObservacoes';
import { useRepertorioMusicas } from '../../../hooks/useRepertorio';
import { estimarDuracaoMusica } from '../../../utils/estimarDuracaoMusica';
import { ColorUtils } from '../../../utils/color_utils';

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  mode?: 'lider' | 'responsavel' | 'leitura';
  responsavelSetlistNome?: string | null;
};

export default function EventoSetlistTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
  mode = 'leitura',
  responsavelSetlistNome,
}: Props) {
  const router = useRouter();
  const palette = usePallete();
  const dataOcorrenciaIso = dataOcorrencia.toISOString();
  const isEditable = mode !== 'leitura';

  const {
    data,
    isLoading,
    criarSetlistItem,
    atualizarSetlistItem,
    removerSetlistItem,
    reordenarSetlist,
    isMutatingSetlist,
  } = useEventoSetlist(eventoId, dataOcorrenciaIso, ministerioId);
  const { data: repertorioData = [] } = useRepertorioMusicas(ministerioId);
  const {
    data: observacoesData,
    salvarObservacoes,
    isSavingObservacoes,
  } = useEventoSetlistObservacoes(eventoId, dataOcorrenciaIso, ministerioId);

  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResponseEventoSetlistItemDto | null>(null);
  const [observacoesVisible, setObservacoesVisible] = useState(false);
  const [observacoesDraft, setObservacoesDraft] = useState('');
  const [orderedItems, setOrderedItems] = useState<ResponseEventoSetlistItemDto[]>([]);

  const repertorio = useMemo(() => (repertorioData ?? []).filter((item) => item.ativo !== false), [repertorioData]);

  const items = useMemo(() => (data ?? []).slice().sort((a, b) => a.ordem - b.ordem), [data]);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const estimativa = useMemo(() => {
    const totalSecoes = orderedItems.reduce((total, item) => total + Math.max(item.totalSecoes || 1, 1), 0);
    return estimarDuracaoMusica({
      bpm: orderedItems.find((item) => item.bpm)?.bpm ?? undefined,
      totalSecoes,
      repeticoes: totalSecoes,
    });
  }, [orderedItems]);

  const openItemEditor = (item?: ResponseEventoSetlistItemDto | null) => {
    setSelectedItem(item ?? null);
    setEditorVisible(true);
  };

  const openObservacoes = () => {
    setObservacoesDraft(observacoesData?.observacoes || '');
    setObservacoesVisible(true);
  };

  const openItemDetails = (item: ResponseEventoSetlistItemDto) => {
    if (!ministerioId) return;

    router.push({
      pathname:
        mode === 'lider'
          ? '/ministerios/agenda/setlist/[itemId]'
          : '/pessoal/escalas/setlist/[itemId]',
      params: {
        itemId: item.id,
        eventoId,
        ministerioId,
        dataOcorrencia: dataOcorrenciaIso,
        modo: mode,
      },
    });
  };

  const handleSalvarObservacoes = async () => {
    if (!ministerioId) return;

    try {
      await salvarObservacoes({
        ministerioId,
        dataOcorrencia: dataOcorrenciaIso,
        observacoes: observacoesDraft.trim(),
      });
      setObservacoesVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Observações atualizadas',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar observações',
        text2: getApiErrorMessage(error, 'Não foi possível salvar as observações do setlist.'),
      });
    }
  };

  const handleDragEnd = async (nextItems: ResponseEventoSetlistItemDto[]) => {
    if (!ministerioId) return;

    setOrderedItems(nextItems);

    try {
      await reordenarSetlist({
        ministerioId,
        dataOcorrencia: dataOcorrenciaIso,
        itemIds: nextItems.map((item) => item.id),
      });
    } catch (error) {
      setOrderedItems(items);
      Toast.show({
        type: 'error',
        text1: 'Erro ao reordenar setlist',
        text2: getApiErrorMessage(error, 'Não foi possível salvar a nova ordem do setlist.'),
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await removerSetlistItem(itemId);
      Toast.show({
        type: 'success',
        text1: 'Música removida do setlist',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover música',
        text2: getApiErrorMessage(error, 'Não foi possível remover esta música do setlist.'),
      });
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {responsavelSetlistNome ? (
        <View style={styles.ownerRow}>
          <FancyChips
            label='Responsável'
            size='small'
            color={palette.secondary}
            backgroundColor={ColorUtils.withAlpha(palette.secondary, 0.1)}
            icon={{ library: 'MaterialCommunityIcons', name: 'music-clef-treble', size: 12 }}
          />
          <FancyText type='medium' size='small'>
            {responsavelSetlistNome}
          </FancyText>
        </View>
      ) : null}

      {(observacoesData?.observacoes || isEditable) && (
        <Pressable
          onPress={isEditable ? openObservacoes : undefined}
          disabled={!isEditable}
          style={[
            styles.observacoesCard,
            {
              backgroundColor: ColorUtils.withAlpha(palette.backgroundColor4, 0.95),
              borderColor: ColorUtils.withAlpha(palette.primary, 0.14),
              ...palette.shadows[100],
            },
          ]}
        >
          <View style={styles.observacoesHeader}>
            <View style={styles.observacoesTitleRow}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='notebook-outline'
                size={17}
                color={palette.primary}
              />
              <FancyText type='semiBold' size='small'>
                Orientações do setlist
              </FancyText>
            </View>

            {isEditable ? (
              <FancyButton
                type='text'
                mode='icon'
                icon={{ library: 'Feather', name: 'edit-2', size: 15, color: palette.primary }}
                containerStyle={styles.iconButton}
                onPress={openObservacoes}
              />
            ) : null}
          </View>

          <FancyText size='small' color={palette.fonts.inactive} numberOfLines={3} style={styles.observacoesText}>
            {observacoesData?.observacoes?.trim() ||
              'Adicione observações gerais para alinhar a equipe nesta ocorrência.'}
          </FancyText>
        </Pressable>
      )}

      <View style={styles.listHeader}>
        <View style={styles.listHeaderInfo}>
          <FancyText type='bold' size='small'>
            {orderedItems.length} {orderedItems.length === 1 ? 'música' : 'músicas'}
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Duração estimada ~{estimativa}
          </FancyText>
        </View>

        {isEditable ? (
          <FancyButton
            label='Adicionar música'
            type='light'
            icon={{ library: 'Feather', name: 'plus', size: 16, color: palette.primary }}
            containerStyle={styles.addButton}
            onPress={() => openItemEditor(null)}
          />
        ) : null}
      </View>
    </View>
  );

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ResponseEventoSetlistItemDto>) => {
    const color = item.hasEstruturaOverride ? palette.terciary : palette.primary;
    const index = (getIndex?.() ?? 0) + 1;

    return (
      <Pressable
        onPress={() => openItemDetails(item)}
        style={[
          styles.songCard,
          {
            backgroundColor: isActive ? ColorUtils.withAlpha(palette.backgroundColor4, 0.94) : palette.backgroundColor2,
            borderColor: ColorUtils.withAlpha(color, isActive ? 0.24 : 0.14),
            ...palette.shadows[100],
          },
        ]}
      >
        <View style={[styles.songAccent, { backgroundColor: ColorUtils.withAlpha(color, 0.9) }]} />

        <View style={styles.songContent}>
          <View style={styles.songTopRow}>
            <View style={styles.songTitleBlock}>
              <View style={[styles.orderBadge, { backgroundColor: ColorUtils.withAlpha(color, 0.1) }]}>
                <FancyText type='semiBold' size='extraSmall' color={color}>
                  {String(index).padStart(2, '0')}
                </FancyText>
              </View>

              <View style={styles.songTextBlock}>
                <FancyText type='semiBold' size='small' numberOfLines={1}>
                  {item.nome}
                </FancyText>
                <FancyText size='extraSmall' color={palette.fonts.inactive} numberOfLines={1}>
                  {item.interprete || 'Sem intérprete informado'}
                </FancyText>
              </View>
            </View>

            <View style={styles.songTopActions}>
              <FancyChips
                label={item.tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO ? 'Repertório' : 'Manual'}
                size='small'
                color={color}
                backgroundColor={ColorUtils.withAlpha(color, 0.08)}
              />

              {isEditable ? (
                <Pressable onLongPress={drag} hitSlop={8} style={styles.handleButton}>
                  <DefaultIcons.Custom
                    library='MaterialCommunityIcons'
                    name='drag-vertical'
                    size={18}
                    color={palette.fonts.inactive}
                  />
                </Pressable>
              ) : (
                <DefaultIcons.Custom
                  library='Feather'
                  name='chevron-right'
                  size={18}
                  color={palette.fonts.inactive}
                />
              )}
            </View>
          </View>

          <View style={styles.songMetaRow}>
            {item.tom ? (
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Tom {item.tom}
              </FancyText>
            ) : null}
            {item.bpm ? (
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                {item.bpm} bpm
              </FancyText>
            ) : null}
            {item.totalSecoes ? (
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                {item.totalSecoes} seções
              </FancyText>
            ) : null}
            {item.hasEstruturaOverride ? (
              <FancyText size='extraSmall' color={color} type='medium'>
                Arranjo próprio
              </FancyText>
            ) : null}
          </View>

          {isEditable ? (
            <View style={styles.songActionsRow}>
              <FancyButton
                type='text'
                mode='icon'
                icon={{ library: 'Feather', name: 'edit-2', size: 15, color: palette.primary }}
                containerStyle={styles.iconButton}
                onPress={() => openItemEditor(item)}
              />
              <FancyButton
                type='text'
                mode='icon'
                icon={{ library: 'Feather', name: 'trash-2', size: 15, color: palette.error }}
                containerStyle={styles.iconButton}
                onPress={() => void handleDeleteItem(item.id)}
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  if (isLoading) return <FancyLoading />;

  return (
    <>
      <View style={styles.container}>
        <DraggableFlatList
          data={orderedItems}
          onDragEnd={({ data: nextItems }) => {
            void handleDragEnd(nextItems);
          }}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          activationDistance={16}
          dragItemOverflow={false}
          containerStyle={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <FancyListEmpty
              label='Nenhuma música definida para esta ocorrência.'
              icon={{ library: 'MaterialCommunityIcons', name: 'playlist-music-outline', size: 56 }}
            />
          }
        />
      </View>

      <EventoSetlistEditorSheet
        visible={editorVisible}
        item={selectedItem}
        repertorio={repertorio}
        canEdit={isEditable}
        onClose={() => setEditorVisible(false)}
        onOpenStructureEditor={(itemId) => {
          const item = orderedItems.find((entry) => entry.id === itemId);
          if (item) {
            setEditorVisible(false);
            openItemDetails(item);
          }
        }}
        onSave={async (payload) => {
          try {
            if (payload.itemId) {
              await atualizarSetlistItem({
                itemId: payload.itemId,
                dto: {
                  ministerioId: ministerioId || '',
                  dataOcorrencia: dataOcorrenciaIso,
                  tipoOrigem: payload.tipoOrigem,
                  repertorioMusicaId: payload.repertorioMusicaId,
                  nome: payload.nome,
                  interprete: payload.interprete,
                  versaoUrl: payload.versaoUrl,
                  tom: payload.tom,
                  bpm: payload.bpm,
                  letraMarkdown: payload.letraMarkdown,
                  cifraMarkdown: payload.cifraMarkdown,
                  observacoes: payload.observacoes,
                },
              });
            } else {
              await criarSetlistItem({
                ministerioId: ministerioId || '',
                dataOcorrencia: dataOcorrenciaIso,
                tipoOrigem: payload.tipoOrigem,
                repertorioMusicaId: payload.repertorioMusicaId,
                nome: payload.nome,
                interprete: payload.interprete,
                versaoUrl: payload.versaoUrl,
                tom: payload.tom,
                bpm: payload.bpm,
                letraMarkdown: payload.letraMarkdown,
                cifraMarkdown: payload.cifraMarkdown,
                observacoes: payload.observacoes,
              });
            }
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Erro ao salvar música do setlist',
              text2: getApiErrorMessage(error, 'Não foi possível salvar a música.'),
            });
          }
        }}
      />

      <FancyBottomSheetModal
        visible={observacoesVisible}
        onClose={() => setObservacoesVisible(false)}
        title='Observações do setlist'
        footer={
          <FancyButton
            label='Salvar observações'
            isLoading={isSavingObservacoes}
            onPress={() => void handleSalvarObservacoes()}
          />
        }
      >
        <View style={styles.sheetContent}>
          <FancyText size='small' color={palette.fonts.inactive}>
            Use este espaço para orientações gerais da equipe, dinâmica do culto ou observações da ocorrência.
          </FancyText>
          <FancyTextInput
            label='Observações'
            value={observacoesDraft}
            inputProps={{
              onChangeText: setObservacoesDraft,
              multiline: true,
              style: { minHeight: 140, textAlignVertical: 'top' },
            }}
          />
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
    gap: 12,
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  observacoesCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  observacoesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  observacoesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  observacoesText: {
    lineHeight: 19,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  addButton: {
    minWidth: 0,
    height: 38,
  },
  songCard: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  songAccent: {
    width: 4,
  },
  songContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  songTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  songTitleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  songTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  handleButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  songActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: -2,
  },
  iconButton: {
    minWidth: 32,
    width: 32,
    height: 32,
  },
  sheetContent: {
    gap: 14,
  },
});
