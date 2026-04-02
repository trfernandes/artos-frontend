import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { formatInTimeZone } from 'date-fns-tz';
import FancyButton from '../../buttons/FancyButton';
import FancyText from '../../FancyText';
import { FancyCard } from '../../cards/Horizontal/FancyCard';
import FancyList from '../../list/FancyList';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import EventoSetlistEditorSheet from './EventoSetlistEditorSheet';
import type { ActionButtonProps } from '../../cards/Horizontal/FancyCardActionButtons';
import { APP_TZ } from '../../../utils/date_utils';
import { ResponseEventoSetlistItemDto, EventoSetlistItemOrigemEnum } from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { useEventoSetlist } from '../../../hooks/useEventoSetlist';
import { useRepertorioMusicas } from '../../../hooks/useRepertorio';
import { getApiErrorMessage } from '../../../domain/api/api-error';

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  canEdit: boolean;
  responsavelSetlistNome?: string | null;
};

export default function EventoSetlistTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
  canEdit,
  responsavelSetlistNome,
}: Props) {
  const dataOcorrenciaIso = dataOcorrencia.toISOString();
  const { data, isLoading, criarSetlistItem, atualizarSetlistItem, removerSetlistItem, reordenarSetlist, isMutatingSetlist } =
    useEventoSetlist(eventoId, dataOcorrenciaIso, ministerioId);
  const { data: repertorioData = [] } = useRepertorioMusicas(ministerioId);
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResponseEventoSetlistItemDto | null>(null);

  const items = useMemo(() => (data ?? []).slice().sort((a, b) => a.ordem - b.ordem), [data]);
  const repertorio = useMemo(() => (repertorioData ?? []).filter((item) => item.ativo !== false), [repertorioData]);

  const openItem = (item?: ResponseEventoSetlistItemDto | null) => {
    setSelectedItem(item ?? null);
    setEditorVisible(true);
  };

  const moveItem = async (itemId: string, direction: -1 | 1) => {
    const currentIndex = items.findIndex((item) => item.id === itemId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = items.map((item) => item.id);
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    await reordenarSetlist({ ministerioId: ministerioId || '', dataOcorrencia: dataOcorrenciaIso, itemIds: reordered });
  };

  if (isLoading) return <FancyLoading />;

  return (
    <View style={styles.container}>
      {responsavelSetlistNome !== undefined ? (
        <View style={styles.ownerSection}>
          <FancyButton
            label='Responsável pelo setlist'
            type='light'
            size={28}
            containerStyle={styles.ownerChip}
          />
          <FancyText type='medium' size='small'>
            {responsavelSetlistNome || 'Não definido'}
          </FancyText>
        </View>
      ) : null}

      {canEdit && (
        <FancyButton
          label='Adicionar música'
          type='contained'
          containerStyle={styles.addButton}
          onPress={() => openItem(null)}
        />
      )}

      {items.length === 0 ? (
        <FancyListEmpty label='Nenhuma música definida para este evento.' />
      ) : (
        <FancyList
          data={items}
          containerStyle={{ flex: 1 }}
          renderItem={({ item }) => {
            const actionButtons: ActionButtonProps[] = [
              { icon: { library: 'Feather' as const, name: 'eye', size: 18 }, onPress: () => openItem(item) },
              ...(canEdit
                ? [
                    { icon: { library: 'Feather' as const, name: 'arrow-up', size: 16 }, onPress: () => void moveItem(item.id, -1) },
                    { icon: { library: 'Feather' as const, name: 'arrow-down', size: 16 }, onPress: () => void moveItem(item.id, 1) },
                    {
                      icon: { library: 'Feather' as const, name: 'trash-2', size: 16, color: 'white', backgroundColor: '#ef4444' },
                      onPress: () => void removerSetlistItem(item.id),
                    },
                  ]
                : []),
            ];

            return (
              <FancyCard.Color
                title={item.nome}
                subtitle={[
                  item.tom ? `Tom ${item.tom}` : null,
                  item.bpm ? `${item.bpm} bpm` : null,
                  item.tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO ? 'Do repertório' : 'Manual',
                ]
                  .filter(Boolean)
                  .join(' • ')}
                color='#2563EB'
                actionButtons={actionButtons}
                content={
                  <View style={styles.content}>
                    <FancyButton
                      label={`Ocorrência ${formatInTimeZone(dataOcorrencia, APP_TZ, 'dd/MM/yyyy')}`}
                      type='light'
                      size={28}
                      containerStyle={styles.occurrenceChip}
                    />
                  </View>
                }
              />
            );
          }}
        />
      )}

      <EventoSetlistEditorSheet
        visible={editorVisible}
        item={selectedItem}
        repertorio={repertorio}
        canEdit={canEdit}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  ownerSection: {
    gap: 6,
  },
  ownerChip: { alignSelf: 'flex-start' },
  addButton: { width: '100%', height: 42 },
  content: { paddingTop: 6 },
  occurrenceChip: { alignSelf: 'flex-start' },
});
