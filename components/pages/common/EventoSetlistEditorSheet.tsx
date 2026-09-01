import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyButton from '../../buttons/FancyButton';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import RepertorioMusicaPickerSheet from './RepertorioMusicaPickerSheet';
import FancyBpmField from '../../fields/FancyBpmField';
import FancyTextInput from '../../fields/FancyTextInput';
import SongTextEditorField from '../../song/SongTextEditorField';
import FancyTabs, { TabItem } from '../../tabs/FancyTabs';
import FancyToggle from '../../fields/FancyToggle';
import FancyText from '../../FancyText';
import YoutubeVersionSearchSheet from './YoutubeVersionSearchSheet';
import { usePallete } from '../../../hooks/usePallete';
import { useLoading } from '../../../contexts/LoadingContext';
import { DefaultIconsNames } from '../../../constants/icons';
import { ColorUtils } from '../../../utils/color_utils';
import {
  ResponseEventoSetlistItemDto,
  EventoSetlistItemOrigemEnum,
} from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { ResponseRepertorioMusicaDto } from '../../../domain/dtos/Repertorio/repertorio-musica.response';
import { ResponseYoutubeSearchItemDto } from '../../../domain/dtos/Repertorio/youtube-search-item.response';
import { useMusicasTocadasRelatorio } from '../../../hooks/useMusicasTocadasRelatorio';

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
  nomesSetlist?: { id: string; nome: string }[];
  canEdit: boolean;
  eventoId?: string;
  dataOcorrenciaIso?: string;
  ministerioId?: string;
};

const TONS = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

export default function EventoSetlistEditorSheet({
  visible,
  onClose,
  onSave,
  item,
  repertorio,
  nomesSetlist = [],
  canEdit,
  eventoId,
  dataOcorrenciaIso,
  ministerioId,
}: Props) {
  const palette = usePallete();
  const relatorioQuery = useMusicasTocadasRelatorio(
    visible && ministerioId ? { ministerioId, eventoId, dataOcorrencia: dataOcorrenciaIso } : null,
  );
  const statsPorMusicaId = useMemo(() => {
    const map = new Map<string, { totalExecucoes: number; ultimaExecucaoEm: string | null }>();
    for (const musica of relatorioQuery.data?.musicas ?? []) {
      if (musica.repertorioMusicaId) {
        map.set(musica.repertorioMusicaId, {
          totalExecucoes: musica.totalExecucoes,
          ultimaExecucaoEm: musica.ultimaExecucaoEm,
        });
      }
    }
    return map;
  }, [relatorioQuery.data]);
  const { showLoading, hideLoading } = useLoading();
  const [tipoOrigem, setTipoOrigem] = useState<EventoSetlistItemOrigemEnum>(
    EventoSetlistItemOrigemEnum.REPERTORIO,
  );
  const [repertorioMusicaId, setRepertorioMusicaId] = useState<string>('');
  const [nome, setNome] = useState('');
  const [interprete, setInterprete] = useState('');
  const [versaoUrl, setVersaoUrl] = useState('');
  const [tom, setTom] = useState('');
  const [bpm, setBpm] = useState<number>(0);
  const [letraMarkdown, setLetraMarkdown] = useState('');
  const [cifraMarkdown, setCifraMarkdown] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [youtubeSearchVisible, setYoutubeSearchVisible] = useState(false);

  useEffect(() => {
    setTipoOrigem(item?.tipoOrigem ?? EventoSetlistItemOrigemEnum.REPERTORIO);
    setRepertorioMusicaId(item?.repertorioMusicaId ?? '');
    setNome(item?.nome ?? '');
    setInterprete(item?.interprete ?? '');
    setVersaoUrl(item?.versaoUrl ?? '');
    setTom(item?.tom ?? '');
    setBpm(item?.bpm ?? 0);
    setLetraMarkdown(item?.letraMarkdown ?? '');
    setCifraMarkdown(item?.cifraMarkdown ?? '');
    setObservacoes(item?.observacoes ?? '');
    setNomeError(null);
  }, [item, visible]);

  const [repertorioPickerVisible, setRepertorioPickerVisible] = useState(false);
  const selectedRepertorioMusica = useMemo(
    () => repertorio.find((musica) => musica.id === repertorioMusicaId),
    [repertorio, repertorioMusicaId],
  );

  const toneOptions = useMemo(() => TONS.map((tone) => ({ title: tone, value: tone })), []);
  const youtubeInitialQuery = useMemo(
    () =>
      [nome, interprete]
        .filter((entry) => entry.trim())
        .join(' ')
        .trim(),
    [nome, interprete],
  );

  const hydrateFromRepertorio = (musicId: string) => {
    setRepertorioMusicaId(musicId);
    const musica = repertorio.find((entry) => entry.id === musicId);
    if (!musica) return;
    setNome(musica.nome);
    setInterprete(musica.interprete || '');
    setVersaoUrl(musica.versaoUrl || '');
    setTom(musica.tomOriginal || '');
    setBpm(musica.bpmOriginal ?? 0);
    setLetraMarkdown(musica.letraMarkdown || '');
    setCifraMarkdown(musica.cifraMarkdown || '');
    setObservacoes(musica.observacoes || '');
  };

  const origemDescription =
    tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO
      ? 'Puxa nome, intérprete, tom, bpm e textos a partir de uma música já cadastrada no repertório.'
      : 'Cria uma canção livre para esta ocorrência, ideal quando a música ainda não existe no repertório.';

  const handleSave = async () => {
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      setNomeError('Informe o nome da música');
      Toast.show({
        type: 'error',
        text1: 'Nome obrigatório',
        text2: 'Informe o nome da música antes de salvar.',
      });
      return;
    }

    const nomeNorm = nomeTrimmed.toLocaleLowerCase();
    const nomeDuplicado = nomesSetlist.some(
      (musica) => musica.id !== item?.id && musica.nome.trim().toLocaleLowerCase() === nomeNorm,
    );
    if (nomeDuplicado) {
      setNomeError('Já existe uma música com esse título no setlist');
      Toast.show({
        type: 'error',
        text1: 'Música duplicada',
        text2: 'Já existe uma música com esse título neste setlist.',
      });
      return;
    }
    setNomeError(null);

    setIsSaving(true);
    showLoading('Salvando...');
    try {
      await onSave({
        itemId: item?.id,
        tipoOrigem,
        repertorioMusicaId: repertorioMusicaId || null,
        nome: nome.trim(),
        interprete: interprete.trim() || undefined,
        versaoUrl: versaoUrl.trim() || undefined,
        tom: tom || undefined,
        bpm: bpm > 0 ? bpm : undefined,
        letraMarkdown: letraMarkdown || undefined,
        cifraMarkdown: cifraMarkdown || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
      hideLoading();
    }
  };

  const handleYoutubeVersionSelect = (selectedVideo: ResponseYoutubeSearchItemDto) => {
    setVersaoUrl(selectedVideo.watchUrl);
    if (!interprete.trim()) {
      setInterprete(selectedVideo.channelTitle);
    }
  };

  // Bloqueia edição durante o saving para evitar mutações concorrentes
  const isEditingEnabled = canEdit && !isSaving;

  const dadosTab = (
    <View style={styles.tabSection}>
      {canEdit ? (
        <View
          style={[
            styles.originCard,
            {
              backgroundColor: ColorUtils.withAlpha(palette.backgroundColor4, 0.92),
              borderColor: ColorUtils.withAlpha(palette.primary, 0.12),
            },
          ]}
        >
          <View style={styles.originHeader}>
            <FancyText type='semiBold' size='small'>
              Como adicionar esta canção
            </FancyText>
            <FancyText
              size='extraSmall'
              color={palette.fonts.inactive}
              style={styles.originHelperText}
            >
              {origemDescription}
            </FancyText>
          </View>

          <FancyToggle<EventoSetlistItemOrigemEnum>
            label='Origem'
            value={tipoOrigem}
            onChange={isEditingEnabled ? setTipoOrigem : () => undefined}
            option1={{ title: 'Repertório', value: EventoSetlistItemOrigemEnum.REPERTORIO }}
            option2={{ title: 'Manual', value: EventoSetlistItemOrigemEnum.MANUAL }}
          />

          {tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO ? (
            <View style={styles.repertorioPickerField}>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Música do repertório
              </FancyText>
              <Pressable
                style={({ pressed }) => [
                  styles.repertorioPickerTrigger,
                  { borderColor: palette.border, backgroundColor: palette.backgroundColor },
                  (!isEditingEnabled || !!item?.id) && { backgroundColor: palette.disabled },
                  pressed && isEditingEnabled && !item?.id && { borderColor: palette.primary },
                ]}
                disabled={!isEditingEnabled || !!item?.id}
                onPress={() => setRepertorioPickerVisible(true)}
              >
                <FancyText
                  style={styles.repertorioPickerTriggerText}
                  color={
                    !isEditingEnabled
                      ? palette.fonts.inactive
                      : selectedRepertorioMusica
                        ? palette.fonts.dark
                        : palette.fonts.inactive
                  }
                  numberOfLines={1}
                >
                  {selectedRepertorioMusica ? selectedRepertorioMusica.nome : 'Selecione...'}
                </FancyText>
                <MaterialCommunityIcons
                  name='chevron-down'
                  size={22}
                  color={
                    !isEditingEnabled || !!item?.id
                      ? palette.icons.inactive2
                      : palette.icons.inactive
                  }
                />
              </Pressable>

              <RepertorioMusicaPickerSheet
                visible={repertorioPickerVisible}
                onClose={() => setRepertorioPickerVisible(false)}
                repertorio={repertorio}
                value={repertorioMusicaId}
                onSelect={hydrateFromRepertorio}
                statsPorMusicaId={statsPorMusicaId}
                hasStats={!!relatorioQuery.data}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <FancyTextInput
        label='Nome *'
        value={nome}
        readonly={!isEditingEnabled}
        errorMessage={nomeError ?? undefined}
        inputProps={{
          onChangeText: isEditingEnabled
            ? (text) => {
                setNome(text);
                if (nomeError) setNomeError(null);
              }
            : undefined,
          editable: isEditingEnabled,
          placeholder: 'Ex: Grato Sou — sem versão ou canal',
        }}
      />
      <FancyTextInput
        label='Intérprete'
        value={interprete}
        readonly={!isEditingEnabled}
        inputProps={{
          onChangeText: isEditingEnabled ? setInterprete : undefined,
          editable: isEditingEnabled,
        }}
      />
      <FancyTextInput
        label='Link da versão'
        value={versaoUrl}
        readonly={!isEditingEnabled}
        inputProps={{
          onChangeText: isEditingEnabled ? setVersaoUrl : undefined,
          editable: isEditingEnabled,
        }}
        rightContainer={
          <View style={styles.versaoUrlIcons}>
            {canEdit ? (
              <Pressable
                onPress={isEditingEnabled ? () => setYoutubeSearchVisible(true) : undefined}
                style={styles.versaoUrlIconButton}
              >
                <MaterialCommunityIcons
                  name='youtube'
                  size={20}
                  color={isEditingEnabled ? palette.primary : palette.icons.inactive2}
                />
              </Pressable>
            ) : null}
            <Pressable
              onPress={versaoUrl ? () => void Linking.openURL(versaoUrl) : undefined}
              style={styles.versaoUrlIconButton}
            >
              <MaterialCommunityIcons
                name='web'
                size={15}
                color={versaoUrl ? palette.primary : palette.icons.inactive2}
              />
            </Pressable>
          </View>
        }
      />

      <View style={styles.inlineRow}>
        <FancyBottomSheetSelect
          label='Tom'
          title='Selecionar tom'
          containerStyle={styles.inlineField}
          value={tom}
          onChange={(value) => setTom(String(value || ''))}
          listItems={toneOptions}
          disabled={!isEditingEnabled}
        />
        <FancyBpmField
          containerStyle={styles.inlineField}
          label='BPM'
          title='Selecionar BPM'
          value={bpm}
          onChange={isEditingEnabled ? setBpm : undefined}
          min={0}
          max={300}
          disabled={!isEditingEnabled}
        />
      </View>

      <FancyTextInput
        label='Observações'
        value={observacoes}
        readonly={!isEditingEnabled}
        inputProps={{
          multiline: true,
          onChangeText: isEditingEnabled ? setObservacoes : undefined,
          editable: isEditingEnabled,
          style: { minHeight: 100, textAlignVertical: 'top' },
        }}
      />
    </View>
  );

  const letraTab = (
    <View style={styles.tabSection}>
      <FancyText size='extraSmall' color={palette.fonts.inactive} style={styles.tabIntro}>
        Defina a letra que será usada nesta ocorrência. Você pode adaptar o conteúdo para esta
        apresentação.
      </FancyText>
      <SongTextEditorField
        label='Letra'
        value={letraMarkdown}
        onChange={setLetraMarkdown}
        disabled={!isEditingEnabled}
        placeholder='Digite a letra da música...'
      />
    </View>
  );

  const cifraTab = (
    <View style={styles.tabSection}>
      <FancyText size='extraSmall' color={palette.fonts.inactive} style={styles.tabIntro}>
        Ajuste a cifra da forma como a equipe vai tocar nesta ocorrência.
      </FancyText>
      <SongTextEditorField
        label='Cifra'
        value={cifraMarkdown}
        onChange={setCifraMarkdown}
        disabled={!isEditingEnabled}
        placeholder='Digite a cifra da música...'
      />
    </View>
  );

  const tabs: TabItem[] = [
    {
      title: 'Dados',
      icon: { library: 'MaterialCommunityIcons', name: 'text-box-outline', size: 16 },
      content: dadosTab,
    },
    {
      title: 'Cifra',
      icon: { library: 'MaterialCommunityIcons', name: 'music-note-outline', size: 16 },
      content: cifraTab,
    },
    {
      title: 'Letra',
      icon: { library: 'MaterialCommunityIcons', name: 'script-text-outline', size: 16 },
      content: letraTab,
    },
  ];

  return (
    <>
      <FancyBottomSheetModal
        visible={visible && !youtubeSearchVisible}
        onClose={() => {
          if (!isSaving) onClose();
        }}
        title={item ? 'Editar música' : 'Adicionar música'}
        closeDisabled={isSaving}
        footer={
          canEdit ? (
            <FancyButton
              label='Salvar'
              icon={{ ...DefaultIconsNames.save, size: 16 }}
              isLoading={isSaving}
              loadingText='Salvando...'
              disabled={isSaving}
              onPress={() => {
                void handleSave();
              }}
            />
          ) : undefined
        }
      >
        <View style={styles.sheetContentWrapper}>
          <View style={styles.sheetContent}>
            <FancyText size='small' color={palette.fonts.inactive} style={styles.sheetSubtitle}>
              Organize os dados principais da música e ajuste letra ou cifra por ocorrência quando
              necessário.
            </FancyText>

            <FancyTabs items={tabs} keepMounted variant='compact' />
          </View>
          {isSaving ? (
            <Pressable
              accessibilityLabel='Salvamento em andamento'
              style={styles.sheetBlockingOverlay}
              onPress={() => undefined}
            />
          ) : null}
        </View>
      </FancyBottomSheetModal>

      <YoutubeVersionSearchSheet
        visible={youtubeSearchVisible}
        onClose={() => setYoutubeSearchVisible(false)}
        initialQuery={youtubeInitialQuery}
        onSelect={handleYoutubeVersionSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sheetContentWrapper: {
    position: 'relative',
  },
  sheetContent: {
    gap: 14,
  },
  sheetBlockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  sheetSubtitle: {
    lineHeight: 19,
  },
  tabsContainer: {
    gap: 12,
  },
  tabsContent: {
    paddingTop: 2,
  },
  tabSection: {
    gap: 14,
  },
  originCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  originHeader: {
    gap: 4,
  },
  originHelperText: {
    lineHeight: 18,
  },
  repertorioPickerField: {
    gap: 6,
  },
  repertorioPickerTrigger: {
    borderWidth: 0.6,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  repertorioPickerTriggerText: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  versaoUrlIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: '100%',
  },
  versaoUrlIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIntro: {
    lineHeight: 18,
  },
});
