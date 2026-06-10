import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancySeparator from '../../FancySeparator';
import FancyButton from '../../buttons/FancyButton';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyChips from '../../FancyChips';
import DefaultIcons from '../../FancyIcons';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import EventoSetlistEditorSheet from './EventoSetlistEditorSheet';
import FancyActionSheet from '../../actions/FancyActionSheet';
import SetListItem from './SetListItem';
import { getApiErrorMessage } from '../../../domain/api/api-error';
import {
  EventoSetlistItemOrigemEnum,
  ResponseEventoSetlistItemDto,
} from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { useAuth } from '../../../contexts/AuthContext';
import { usePallete } from '../../../hooks/usePallete';
import { useEventoSetlist } from '../../../hooks/useEventoSetlist';
import { useEventoEquipe } from '../../../hooks/useEventoEquipe';
import { useEventoSetlistObservacoes } from '../../../hooks/useEventoSetlistObservacoes';
import { useEventoSetlistResponsavel } from '../../../hooks/useEventoSetlistResponsavel';
import { useRepertorioMusicas } from '../../../hooks/useRepertorio';
import { ColorUtils } from '../../../utils/color_utils';
import { DefaultIconsNames } from '../../../constants/icons';

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  mode?: 'lider' | 'responsavel' | 'leitura';
  responsavelSetlistNome?: string | null;
  detailsRoutePath?: '/ministerios/agenda/setlist/[itemId]' | '/pessoal/escalas/setlist/[itemId]';
};

export default function EventoSetlistTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
  mode = 'leitura',
  responsavelSetlistNome,
  detailsRoutePath = '/ministerios/agenda/setlist/[itemId]',
}: Props) {
  const palette = usePallete();
  const isDark = palette.backgroundColor === '#121212';
  const { user } = useAuth();
  const dataOcorrenciaIso = dataOcorrencia.toISOString();
  const isEditable = mode !== 'leitura';
  const canManageResponsavel = mode === 'lider';
  const canAddMusic = mode === 'lider' || mode === 'responsavel';

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
  const { data: equipeData, refetch: refetchEquipe } = useEventoEquipe(
    eventoId,
    dataOcorrenciaIso,
    ministerioId,
  );
  const { salvarResponsavelSetlist, isSavingResponsavelSetlist } = useEventoSetlistResponsavel();

  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResponseEventoSetlistItemDto | null>(null);
  const [observacoesVisible, setObservacoesVisible] = useState(false);
  const [observacoesDraft, setObservacoesDraft] = useState('');
  const [responsavelVisible, setResponsavelVisible] = useState(false);
  const [responsavelSelecionadoId, setResponsavelSelecionadoId] = useState('');
  const [isSalvandoResponsavel, setIsSalvandoResponsavel] = useState(false);
  const [orderedItems, setOrderedItems] = useState<ResponseEventoSetlistItemDto[]>([]);
  const [actionsItem, setActionsItem] = useState<ResponseEventoSetlistItemDto | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const repertorio = useMemo(
    () => (repertorioData ?? []).filter((item) => item.ativo !== false),
    [repertorioData],
  );

  const items = useMemo(() => (data ?? []).slice().sort((a, b) => a.ordem - b.ordem), [data]);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const integrantesEquipeOptions = useMemo(() => {
    const seen = new Set<string>();
    return (
      equipeData?.grupos.flatMap((grupo) =>
        grupo.integrantes
          .filter((integrante) => integrante.voluntario?.id)
          .map((integrante) => integrante.voluntario!)
          .filter((voluntario) => {
            if (seen.has(voluntario.id)) return false;
            seen.add(voluntario.id);
            return true;
          })
          .map((voluntario) => ({
            title: voluntario.nome,
            value: voluntario.id,
            left:
              voluntario.fotoThumbUrl || voluntario.fotoUrl
                ? {
                    type: 'image' as const,
                    source: voluntario.fotoThumbUrl || voluntario.fotoUrl || '',
                  }
                : {
                    type: 'icon' as const,
                    icon: {
                      library: 'MaterialCommunityIcons' as const,
                      name: 'account-circle-outline',
                      size: 20,
                      color: palette.fonts.inactive,
                    },
                  },
          })),
      ) ?? []
    );
  }, [equipeData?.grupos, palette.fonts.inactive]);

  const responsavelAtualId =
    equipeData?.responsavelSetlistVoluntario?.id ||
    equipeData?.responsavelSetlistVoluntarioId ||
    '';
  const responsavelAtualNome =
    equipeData?.responsavelSetlistVoluntario?.nome || responsavelSetlistNome || null;
  const isCurrentUserResponsavel = !!responsavelAtualId && responsavelAtualId === user?.user?.id;
  const responsavelDescricao = responsavelAtualNome
    ? isCurrentUserResponsavel
      ? 'Você define a seleção musical desta ocorrência.'
      : `${responsavelAtualNome} define a seleção musical desta ocorrência.`
    : canManageResponsavel
      ? 'Defina quem escolhe as músicas desta ocorrência.'
      : 'O líder ainda não definiu quem escolhe as músicas desta ocorrência.';

  const openItemEditor = (item?: ResponseEventoSetlistItemDto | null) => {
    setSelectedItem(item ?? null);
    setEditorVisible(true);
  };

  const openObservacoes = () => {
    setObservacoesDraft(observacoesData?.observacoes || '');
    setObservacoesVisible(true);
  };

  const openResponsavel = () => {
    setResponsavelSelecionadoId(responsavelAtualId);
    setResponsavelVisible(true);
  };

  const openItemDetails = (item: ResponseEventoSetlistItemDto) => {
    if (isEditable) {
      openItemEditor(item);
      return;
    }

    if (!ministerioId) return;

    router.push({
      pathname: detailsRoutePath,
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

  const handleSalvarResponsavel = async () => {
    if (!ministerioId || !responsavelSelecionadoId) return;

    setIsSalvandoResponsavel(true);
    try {
      await salvarResponsavelSetlist({
        eventoId,
        data: {
          ministerioId,
          dataOcorrencia: dataOcorrenciaIso,
          responsavelVoluntarioId: responsavelSelecionadoId,
          escopo: 'OCORRENCIA' as any,
        },
      });
      await refetchEquipe();
      setResponsavelVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Responsável do SetList atualizado',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar responsável',
        text2: getApiErrorMessage(error, 'Não foi possível atualizar o responsável do SetList.'),
      });
    } finally {
      setIsSalvandoResponsavel(false);
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
    setDeletingItemId(itemId);
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
    } finally {
      setDeletingItemId(null);
    }
  };

  const openItemActions = (item: ResponseEventoSetlistItemDto) => {
    setActionsItem(item);
  };

  const closeItemActions = () => {
    setActionsItem(null);
  };

  const selectedItemIndex = useMemo(() => {
    if (!actionsItem) return -1;
    return orderedItems.findIndex((entry) => entry.id === actionsItem.id);
  }, [actionsItem, orderedItems]);

  const moveItemBySheet = async (direction: 'up' | 'down') => {
    if (!actionsItem) return;

    const currentIndex = orderedItems.findIndex((entry) => entry.id === actionsItem.id);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedItems.length) return;

    const nextItems = [...orderedItems];
    const [movedItem] = nextItems.splice(currentIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);

    closeItemActions();
    await handleDragEnd(nextItems);
  };

  const confirmDeleteItem = (item: ResponseEventoSetlistItemDto) => {
    Alert.alert('Excluir música?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          closeItemActions();
          void handleDeleteItem(item.id);
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View
        style={[
          styles.ownerCard,
          {
            backgroundColor: isDark
              ? palette.backgroundColor4
              : ColorUtils.lightenColor(palette.secondary, 0.955),
            borderColor: ColorUtils.withAlpha(palette.secondary, isDark ? 0.32 : 0.16),
          },
        ]}
      >
        <View style={styles.ownerLeading}>
          <View
            style={[
              styles.ownerIconWrap,
              {
                backgroundColor: isDark
                  ? ColorUtils.withAlpha(palette.secondary, 0.16)
                  : ColorUtils.withAlpha('#FFFFFF', 0.92),
                borderColor: ColorUtils.withAlpha(palette.secondary, isDark ? 0.28 : 0.14),
              },
            ]}
          >
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name={responsavelAtualNome ? 'music-clef-treble' : 'account-question-outline'}
              size={14}
              color={palette.secondary}
            />
          </View>
          <View style={styles.ownerTextBlock}>
            {/* Eyebrow: rótulo fixo da seção + chip "Você" */}
            <View style={styles.ownerEyebrowRow}>
              <FancyText
                size='extraSmall'
                type='semiBold'
                style={[
                  styles.ownerEyebrow,
                  { color: ColorUtils.withAlpha(palette.secondary, 0.88) },
                ]}
              >
                Responsável
              </FancyText>
              {isCurrentUserResponsavel ? (
                <FancyChips
                  label='Você'
                  size='small'
                  color={palette.secondary}
                  backgroundColor={ColorUtils.withAlpha(palette.secondary, 0.12)}
                />
              ) : null}
            </View>
            {/* Título: nome do responsável ou estado vazio */}
            <FancyText
              size='small'
              type='semiBold'
              numberOfLines={1}
              color={responsavelAtualNome ? palette.fonts.dark : palette.fonts.inactive}
              style={styles.ownerTitle}
            >
              {isCurrentUserResponsavel ? 'Você' : responsavelAtualNome || 'Nenhum responsável'}
            </FancyText>
          </View>
        </View>

        {canManageResponsavel ? (
          <Pressable
            onPress={openResponsavel}
            accessibilityRole='button'
            accessibilityLabel='Definir responsável do SetList'
            hitSlop={8}
            style={[
              styles.ownerActionButton,
              {
                backgroundColor: ColorUtils.withAlpha('#FFFFFF', 0.94),
                borderColor: ColorUtils.withAlpha(palette.secondary, isDark ? 0.28 : 0.14),
              },
              isDark && { backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.16) },
            ]}
          >
            <MaterialCommunityIcons
              name={responsavelAtualNome ? 'account-switch-outline' : 'account-plus-outline'}
              size={15}
              color={palette.secondary}
            />
          </Pressable>
        ) : null}
      </View>

      {(observacoesData?.observacoes || isEditable) && (
        <Pressable
          onPress={isEditable ? openObservacoes : undefined}
          disabled={!isEditable}
          style={[
            styles.observacoesCard,
            {
              backgroundColor: isDark
                ? palette.backgroundColor4
                : ColorUtils.lightenColor(palette.primary, 0.94),
              borderColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.32 : 0.18),
            },
          ]}
        >
          <View style={styles.observacoesLeading}>
            <View
              style={[
                styles.observacoesIconWrap,
                {
                  backgroundColor: isDark
                    ? ColorUtils.withAlpha(palette.primary, 0.16)
                    : ColorUtils.withAlpha('#FFFFFF', 0.92),
                  borderColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.28 : 0.14),
                },
              ]}
            >
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name={isEditable ? 'text-box-outline' : 'information-outline'}
                size={14}
                color={palette.primary}
              />
            </View>
            <View style={styles.observacoesInfo}>
              {/* Eyebrow: rótulo fixo */}
              <FancyText
                size='extraSmall'
                type='semiBold'
                style={[
                  styles.ownerEyebrow,
                  { color: ColorUtils.withAlpha(palette.primary, 0.86) },
                ]}
              >
                Orientações gerais
              </FancyText>
              {/* Título: preview do conteúdo ou estado vazio */}
              <FancyText
                size='small'
                type='semiBold'
                numberOfLines={2}
                color={
                  observacoesData?.observacoes?.trim() ? palette.fonts.dark : palette.fonts.inactive
                }
                style={styles.observacoesTitle}
              >
                {observacoesData?.observacoes?.trim() || 'Nenhuma orientação'}
              </FancyText>
            </View>
          </View>

          {isEditable ? (
            <Pressable
              onPress={openObservacoes}
              accessibilityRole='button'
              accessibilityLabel='Editar orientações do SetList'
              hitSlop={8}
              style={[
                styles.observacoesActionButton,
                {
                  backgroundColor: ColorUtils.withAlpha('#FFFFFF', 0.94),
                  borderColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.28 : 0.14),
                },
                isDark && { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.16) },
              ]}
            >
              <MaterialCommunityIcons name='pencil-outline' size={15} color={palette.primary} />
            </Pressable>
          ) : null}
        </Pressable>
      )}

      {orderedItems.length > 0 && <FancySeparator style={styles.sectionDivider} />}

      {canAddMusic && (
        <View style={styles.listHeader}>
          <FancyButton
            label='Nova música'
            type='contained'
            size={34}
            icon={{
              library: 'MaterialCommunityIcons',
              name: 'music-note-plus',
              size: 15,
              color: palette.fonts.light,
            }}
            containerStyle={styles.addMusicButton}
            onPress={() => openItemEditor(null)}
          />
        </View>
      )}
    </View>
  );

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ResponseEventoSetlistItemDto>) => {
    const index = (getIndex?.() ?? 0) + 1;
    return (
      <SetListItem
        order={index}
        total={orderedItems.length}
        name={item.nome}
        artist={item.interprete}
        tipoOrigem={item.tipoOrigem}
        totalSecoes={item.totalSecoes}
        tom={item.tom}
        bpm={item.bpm}
        onPress={() => openItemDetails(item)}
        onActionsPress={isEditable ? () => openItemActions(item) : undefined}
        onLongPress={isEditable ? drag : undefined}
        isEditable={isEditable}
        isActive={isActive}
      />
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
          contentContainerStyle={[
            styles.listContent,
            orderedItems.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FancyListEmpty
                label='Nenhuma música adicionada'
                helperText={
                  canAddMusic
                    ? 'Adicione as músicas desta ocorrência para definir a sequência e acompanhar a duração total.'
                    : 'Quando o responsável montar o SetList, as músicas aparecerão aqui para consulta.'
                }
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'playlist-music-outline',
                  size: 56,
                }}
                muted={false}
              />
            </View>
          }
        />
        {isMutatingSetlist || deletingItemId ? (
          <View style={styles.blockingOverlay} pointerEvents='auto'>
            <View
              style={[
                styles.blockingOverlayContent,
                { backgroundColor: palette.backgroundColor4, borderColor: palette.borderCard },
              ]}
            >
              <FancyLoading
                label={deletingItemId ? 'Removendo música...' : 'Atualizando setlist...'}
                containerStyle={{ flex: 0 }}
              />
            </View>
          </View>
        ) : null}
      </View>

      <EventoSetlistEditorSheet
        visible={editorVisible}
        item={selectedItem}
        repertorio={repertorio}
        canEdit={isEditable}
        onClose={() => setEditorVisible(false)}
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
        onClose={() => {
          if (!isSavingObservacoes) setObservacoesVisible(false);
        }}
        title='Orientações'
        closeDisabled={isSavingObservacoes}
        footer={
          <FancyButton
            label='Salvar'
            icon={{ ...DefaultIconsNames.save, size: 16 }}
            isLoading={isSavingObservacoes}
            loadingText='Salvando...'
            disabled={isSavingObservacoes}
            onPress={() => void handleSalvarObservacoes()}
          />
        }
      >
        <View style={styles.sheetContentWrapper}>
          <View style={styles.sheetContent}>
            <FancyText size='small' color={palette.fonts.inactive}>
              Use este espaço para orientações gerais da equipe, dinâmica do culto ou observações da
              ocorrência.
            </FancyText>
            <FancyTextInput
              label='Observações'
              value={observacoesDraft}
              readonly={isSavingObservacoes}
              disabled={isSavingObservacoes}
              inputProps={{
                onChangeText: isSavingObservacoes ? undefined : setObservacoesDraft,
                multiline: true,
                style: { minHeight: 140, textAlignVertical: 'top' },
                editable: !isSavingObservacoes,
              }}
            />
          </View>
          {isSavingObservacoes ? (
            <Pressable
              accessibilityLabel='Salvamento em andamento'
              style={styles.sheetBlockingOverlay}
              onPress={() => undefined}
            />
          ) : null}
        </View>
      </FancyBottomSheetModal>

      <FancyBottomSheetModal
        visible={responsavelVisible}
        onClose={() => {
          if (!isSalvandoResponsavel) setResponsavelVisible(false);
        }}
        title='Responsável do SetList'
        closeDisabled={isSalvandoResponsavel}
        footer={
          <FancyButton
            label='Salvar'
            icon={{ ...DefaultIconsNames.save, size: 16 }}
            isLoading={isSalvandoResponsavel}
            loadingText='Salvando...'
            disabled={!responsavelSelecionadoId || isSalvandoResponsavel}
            onPress={() => void handleSalvarResponsavel()}
          />
        }
      >
        <View style={styles.sheetContentWrapper}>
          <View style={styles.sheetContent}>
            <FancyText size='small' color={palette.fonts.inactive}>
              Escolha quem conduz o SetList desta ocorrência.
            </FancyText>
            <FancyBottomSheetSelect
              label='Voluntário'
              title='Selecionar responsável'
              value={responsavelSelecionadoId}
              onChange={(value) => setResponsavelSelecionadoId(String(value || ''))}
              listItems={integrantesEquipeOptions}
              disabled={isSalvandoResponsavel}
            />
          </View>
          {isSalvandoResponsavel ? (
            <Pressable
              accessibilityLabel='Salvamento em andamento'
              style={styles.sheetBlockingOverlay}
              onPress={() => undefined}
            />
          ) : null}
        </View>
      </FancyBottomSheetModal>

      <FancyActionSheet
        visible={!!actionsItem}
        onClose={closeItemActions}
        title='Opções'
        actions={actionsItem ? [
          {
            label: 'Editar',
            icon: { library: 'MaterialCommunityIcons' as const, name: 'pencil-outline', size: 18 },
            onPress: () => openItemEditor(actionsItem),
          },
          {
            label: 'Mover para cima',
            icon: { library: 'MaterialCommunityIcons' as const, name: 'arrow-up', size: 18 },
            onPress: () => void moveItemBySheet('up'),
            disabled: selectedItemIndex <= 0,
          },
          {
            label: 'Mover para baixo',
            icon: { library: 'MaterialCommunityIcons' as const, name: 'arrow-down', size: 18 },
            onPress: () => void moveItemBySheet('down'),
            disabled: selectedItemIndex < 0 || selectedItemIndex >= orderedItems.length - 1,
          },
          {
            label: 'Excluir',
            icon: { library: 'MaterialCommunityIcons' as const, name: 'trash-can-outline', size: 18 },
            onPress: () => confirmDeleteItem(actionsItem),
            destructive: true,
          },
        ] : []}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 28,
    gap: 12,
  },
  listContentEmpty: {
    paddingBottom: 10,
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  ownerCard: {
    borderWidth: 0.6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  ownerLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  ownerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerTextBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  ownerEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerEyebrow: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.16,
    includeFontPadding: false,
  },
  ownerTitle: {
    fontSize: 12.5,
    lineHeight: 15,
    includeFontPadding: false,
  },
  ownerSubtitle: {
    // tamanho definido via prop size no FancyText
  },
  ownerActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  observacoesCard: {
    borderWidth: 0.6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  observacoesLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  observacoesIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  observacoesInfo: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  observacoesTitle: {
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 15,
    includeFontPadding: false,
  },
  observacoesSubtitle: {
    flexShrink: 1,
  },
  observacoesActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDivider: {
    marginVertical: 6,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  addMusicButton: {
    minWidth: 0,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  emptyState: {
    flexGrow: 1,
    minHeight: 188,
    justifyContent: 'flex-start',
    paddingTop: 18,
  },
  sheetContent: {
    gap: 14,
  },
  sheetContentWrapper: {
    position: 'relative',
  },
  sheetBlockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  blockingOverlayContent: {
    minWidth: 190,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
});
