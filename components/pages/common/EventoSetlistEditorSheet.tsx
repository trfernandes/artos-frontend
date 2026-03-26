import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyButton from '../../buttons/FancyButton';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyTextInput from '../../fields/FancyTextInput';
import SongTextEditorField from '../../song/SongTextEditorField';
import { ResponseEventoSetlistItemDto, EventoSetlistItemOrigemEnum } from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { ResponseRepertorioMusicaDto } from '../../../domain/dtos/Repertorio/repertorio-musica.response';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    itemId?: string;
    tipoOrigem: EventoSetlistItemOrigemEnum;
    repertorioMusicaId?: string | null;
    nome: string;
    interprete?: string;
    versaoUrl?: string;
    tom?: string;
    bpm?: number;
    letraMarkdown?: string;
    cifraMarkdown?: string;
    observacoes?: string;
  }) => Promise<void>;
  item?: ResponseEventoSetlistItemDto | null;
  repertorio: ResponseRepertorioMusicaDto[];
  canEdit: boolean;
};

const TONS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function EventoSetlistEditorSheet({ visible, onClose, onSave, item, repertorio, canEdit }: Props) {
  const [tipoOrigem, setTipoOrigem] = useState<EventoSetlistItemOrigemEnum>(EventoSetlistItemOrigemEnum.MANUAL);
  const [repertorioMusicaId, setRepertorioMusicaId] = useState<string>('');
  const [nome, setNome] = useState('');
  const [interprete, setInterprete] = useState('');
  const [versaoUrl, setVersaoUrl] = useState('');
  const [tom, setTom] = useState('');
  const [bpm, setBpm] = useState('');
  const [letraMarkdown, setLetraMarkdown] = useState('');
  const [cifraMarkdown, setCifraMarkdown] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTipoOrigem(item?.tipoOrigem ?? EventoSetlistItemOrigemEnum.MANUAL);
    setRepertorioMusicaId(item?.repertorioMusicaId ?? '');
    setNome(item?.nome ?? '');
    setInterprete(item?.interprete ?? '');
    setVersaoUrl(item?.versaoUrl ?? '');
    setTom(item?.tom ?? '');
    setBpm(item?.bpm ? String(item.bpm) : '');
    setLetraMarkdown(item?.letraMarkdown ?? '');
    setCifraMarkdown(item?.cifraMarkdown ?? '');
    setObservacoes(item?.observacoes ?? '');
  }, [item, visible]);

  const repertorioOptions = useMemo(
    () =>
      repertorio.map((musica) => ({
        title: musica.nome,
        subtitle: musica.interprete || musica.categoria?.nome || '',
        value: musica.id,
      })),
    [repertorio],
  );

  const toneOptions = useMemo(() => TONS.map((tone) => ({ title: tone, value: tone })), []);

  const hydrateFromRepertorio = (musicId: string) => {
    setRepertorioMusicaId(musicId);
    const musica = repertorio.find((entry) => entry.id === musicId);
    if (!musica) return;
    setNome(musica.nome);
    setInterprete(musica.interprete || '');
    setVersaoUrl(musica.versaoUrl || '');
    setTom(musica.tomOriginal || '');
    setBpm(musica.bpmOriginal ? String(musica.bpmOriginal) : '');
    setLetraMarkdown(musica.letraMarkdown || '');
    setCifraMarkdown(musica.cifraMarkdown || '');
    setObservacoes(musica.observacoes || '');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        itemId: item?.id,
        tipoOrigem,
        repertorioMusicaId: repertorioMusicaId || null,
        nome,
        interprete: interprete || undefined,
        versaoUrl: versaoUrl || undefined,
        tom: tom || undefined,
        bpm: bpm ? Number(bpm) : undefined,
        letraMarkdown: letraMarkdown || undefined,
        cifraMarkdown: cifraMarkdown || undefined,
        observacoes: observacoes || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={item ? 'Detalhes da música' : 'Nova música do setlist'}
      footer={
        canEdit ? (
          <FancyButton
            label='Salvar'
            isLoading={isSaving}
            onPress={() => {
              void handleSave();
            }}
          />
        ) : undefined
      }
    >
      <View style={styles.form}>
        {canEdit && (
          <>
            <FancyBottomSheetSelect
              title='Origem'
              value={tipoOrigem}
              onChange={(value) => setTipoOrigem(value as EventoSetlistItemOrigemEnum)}
              listItems={[
                { title: 'Manual', value: EventoSetlistItemOrigemEnum.MANUAL },
                { title: 'Do repertório', value: EventoSetlistItemOrigemEnum.REPERTORIO },
              ]}
            />
            {tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO && (
              <FancyBottomSheetSelect
                title='Música do repertório'
                value={repertorioMusicaId}
                onChange={(value) => hydrateFromRepertorio(String(value))}
                listItems={repertorioOptions}
              />
            )}
          </>
        )}

        <FancyTextInput label='Nome' value={nome} readonly={!canEdit} inputProps={{ onChangeText: setNome }} />
        <FancyTextInput label='Intérprete' value={interprete} readonly={!canEdit} inputProps={{ onChangeText: setInterprete }} />
        <FancyTextInput
          label='Link da versão'
          value={versaoUrl}
          readonly={!canEdit}
          inputProps={{ onChangeText: setVersaoUrl }}
          rightContainer={
            versaoUrl
              ? [{ icon: { library: 'Feather', name: 'external-link', size: 18 }, onPress: () => Linking.openURL(versaoUrl) }]
              : undefined
          }
        />

        <View style={styles.inlineRow}>
          <FancyBottomSheetSelect
            title='Tom'
            containerStyle={{ flex: 1 }}
            value={tom}
            onChange={(value) => setTom(String(value || ''))}
            listItems={toneOptions}
            disabled={!canEdit}
          />
          <FancyTextInput
            label='BPM'
            value={bpm}
            readonly={!canEdit}
            containerStyle={{ flex: 1 }}
            inputProps={{ keyboardType: 'numeric', onChangeText: setBpm }}
          />
        </View>

        <SongTextEditorField label='Letra' value={letraMarkdown} onChange={setLetraMarkdown} disabled={!canEdit} placeholder='Digite a letra da música...' />
        <SongTextEditorField label='Cifra' value={cifraMarkdown} onChange={setCifraMarkdown} disabled={!canEdit} placeholder='Digite a cifra da música...' />
        <FancyTextInput
          label='Observações'
          value={observacoes}
          readonly={!canEdit}
          inputProps={{ multiline: true, onChangeText: setObservacoes, style: { minHeight: 110, textAlignVertical: 'top' } }}
        />
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  inlineRow: { flexDirection: 'row', gap: 10 },
});
