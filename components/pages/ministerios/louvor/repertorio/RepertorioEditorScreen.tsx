import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import FancyBottomSheetSelect from '../../../../fields/FancyBottomSheetSelect';
import FancyBpmField from '../../../../fields/FancyBpmField';
import FancyButton from '../../../../buttons/FancyButton';
import FancyPageView from '../../../../containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyLoading from '../../../../FancyLoading';
import FancyScrollView from '../../../../FancyScrollView';
import SongTextEditorField from '../../../../song/SongTextEditorField';
import RepertorioCategoriasManagerSheet from './RepertorioCategoriasManagerSheet';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { RecursoPermissaoEnum, TipoPermissaoEnum } from '../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { useRepertorioCategorias, useRepertorioMusicas } from '../../../../../hooks/useRepertorio';
import { RepertorioRepository } from '../../../../../domain/services/RepertorioRepository';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import YoutubeVersionSearchSheet from '../../../common/YoutubeVersionSearchSheet';
import { ResponseYoutubeSearchItemDto } from '../../../../../domain/dtos/Repertorio/youtube-search-item.response';
import FancyListEmpty from '../../../../list/FancyListEmpty';

const TONS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

type Props = {
  ministerioId?: string;
  musicaId?: string;
  readOnly?: boolean;
  onSaved?: () => void;
};

export default function RepertorioEditorScreen({ ministerioId: ministerioIdProp, musicaId, readOnly = false, onSaved }: Props) {
  const navigation = useNavigation<any>();
  const { igrejaAtiva } = useAuth();
  const palette = usePallete();
  const fallbackMinisterioId = igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)?.id;
  const ministerioId = ministerioIdProp || fallbackMinisterioId;
  const ministerioAtual = igrejaAtiva?.ministerios?.find((ministerio) => ministerio.id === ministerioId);
  const { data: categorias = [] } = useRepertorioCategorias();
  const { criarMusica, atualizarMusica, isMutatingMusica } = useRepertorioMusicas(ministerioId);
  const [categoriasVisible, setCategoriasVisible] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const canManageRepertorio = useMemo(() => {
    const hierarquia = ministerioAtual?.hierarquia?.toString();
    if (hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1') {
      return true;
    }
    return (ministerioAtual?.permissoes ?? []).some(
      (item) => item.recurso === RecursoPermissaoEnum.RepertorioSetlist && item.permissoes?.includes(TipoPermissaoEnum.Gerenciar),
    );
  }, [ministerioAtual]);

  const canEditRepertorio = canManageRepertorio && !readOnly;

  useEffect(() => {
    if (!readOnly) return;
    navigation.setOptions({ title: 'Detalhes da Música' });
  }, [navigation, readOnly]);

  const musicaQuery = useQuery({
    queryKey: ['repertorio-musica', igrejaAtiva?.id, ministerioId, musicaId],
    enabled: !!igrejaAtiva?.id && !!ministerioId && !!musicaId,
    queryFn: () => RepertorioRepository.getMusica(igrejaAtiva!.id, ministerioId!, musicaId!),
  });

  const musica = musicaQuery.data;
  const [nome, setNome] = useState(musica?.nome || '');
  const [interprete, setInterprete] = useState(musica?.interprete || '');
  const [versaoUrl, setVersaoUrl] = useState(musica?.versaoUrl || '');
  const [categoriaId, setCategoriaId] = useState(musica?.categoriaId || '');
  const [tomOriginal, setTomOriginal] = useState(musica?.tomOriginal || '');
  const [bpmOriginal, setBpmOriginal] = useState<number>(musica?.bpmOriginal ?? 0);
  const [letraMarkdown, setLetraMarkdown] = useState(musica?.letraMarkdown || '');
  const [cifraMarkdown, setCifraMarkdown] = useState(musica?.cifraMarkdown || '');
  const [observacoes, setObservacoes] = useState(musica?.observacoes || '');
  const [youtubeSearchVisible, setYoutubeSearchVisible] = useState(false);

  useEffect(() => {
    if (!musica) return;
    setNome(musica.nome || '');
    setInterprete(musica.interprete || '');
    setVersaoUrl(musica.versaoUrl || '');
    setCategoriaId(musica.categoriaId || '');
    setTomOriginal(musica.tomOriginal || '');
    setBpmOriginal(musica.bpmOriginal ?? 0);
    setLetraMarkdown(musica.letraMarkdown || '');
    setCifraMarkdown(musica.cifraMarkdown || '');
    setObservacoes(musica.observacoes || '');
  }, [musica]);

  const categoryOptions = useMemo(
    () => categorias.filter((item) => item.ativo !== false).map((categoria) => ({ title: categoria.nome, value: categoria.id })),
    [categorias],
  );
  const toneOptions = useMemo(() => TONS.map((tone) => ({ title: tone, value: tone })), []);
  const youtubeInitialQuery = useMemo(() => [nome, interprete].filter((entry) => entry.trim()).join(' ').trim(), [nome, interprete]);
  const versaoUrlNormalizada = useMemo(() => {
    const rawUrl = versaoUrl.trim();
    if (!rawUrl) return '';
    return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  }, [versaoUrl]);

  const handleSave = async () => {
    if (!igrejaAtiva?.id || !ministerioId) return;
    if (!canEditRepertorio) {
      FancyAlert.alert('Sem permissão', 'Você pode visualizar o repertório, mas não possui permissão para editar músicas.');
      return;
    }
    if (!nome.trim() || !categoriaId) {
      FancyAlert.alert('Campos obrigatórios', 'Nome da música e categoria são obrigatórios.');
      return;
    }

    try {
      const payload = {
        ministerioId,
        categoriaId,
        nome: nome.trim(),
        interprete: interprete || undefined,
        versaoUrl: versaoUrl || undefined,
        tomOriginal: tomOriginal || undefined,
        bpmOriginal: bpmOriginal > 0 ? bpmOriginal : undefined,
        letraMarkdown: letraMarkdown || undefined,
        cifraMarkdown: cifraMarkdown || undefined,
        observacoes: observacoes || undefined,
      };
      if (musicaId) {
        await atualizarMusica({ id: musicaId, dto: payload });
      } else {
        await criarMusica(payload);
      }
      onSaved?.();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar música',
        text2: getApiErrorMessage(error, 'Não foi possível salvar a música do repertório.'),
      });
    }
  };

  const handleYoutubeVersionSelect = (selectedVideo: ResponseYoutubeSearchItemDto) => {
    setVersaoUrl(selectedVideo.watchUrl);
    if (!nome.trim()) {
      setNome(selectedVideo.title);
    }
    if (!interprete.trim()) {
      setInterprete(selectedVideo.channelTitle);
    }
  };

  const renderSongTextReadOnly = (title: 'Letra' | 'Cifra', value: string) => {
    const hasContent = value.trim().length > 0;
    const isCifra = title === 'Cifra';
    const metaItems = [
      interprete.trim() || 'Sem intérprete',
      bpmOriginal > 0 ? `${bpmOriginal} BPM` : null,
      tomOriginal ? `Tom ${tomOriginal}` : null,
    ].filter(Boolean);

    return (
      <FancyScrollView fill contentContainerStyle={styles.readOnlyTextContent} showsVerticalScrollIndicator={false}>
        <View style={styles.songReadHeader}>
          <FancyText type='bold' size='largeMedium' color={palette.fonts.dark} numberOfLines={2}>
            {nome.trim() || 'Música sem nome'}
          </FancyText>
          <View style={styles.songReadMetaRow}>
            {metaItems.map((item) => (
              <View
                key={String(item)}
                style={[
                  styles.songReadMetaPill,
                  {
                    backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
                    borderColor: ColorUtils.withAlpha(palette.primary, 0.12),
                  },
                ]}
              >
                <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive} numberOfLines={1}>
                  {item}
                </FancyText>
              </View>
            ))}
          </View>
        </View>

        {hasContent ? (
          <FancyText
            selectable
            size='small'
            color={palette.fonts.dark}
            style={[styles.readOnlyText, isCifra && styles.readOnlyChordText]}
          >
            {value.trim()}
          </FancyText>
        ) : (
          <View style={styles.emptySongText}>
            <FancyListEmpty
              label={`Nenhuma ${title.toLowerCase()} cadastrada`}
              helperText='Quando houver conteúdo, ele aparecerá aqui para consulta da equipe.'
              icon={{ library: 'MaterialCommunityIcons', name: isCifra ? 'guitar-acoustic' : 'text-box-outline', size: 58 }}
            />
          </View>
        )}
      </FancyScrollView>
    );
  };

  const tabs: TabItem[] = [
    {
      title: 'Dados',
      icon: { library: 'Feather', name: 'info', size: 16 },
      content: (
        <FancyScrollView fill contentContainerStyle={styles.formSection} showsVerticalScrollIndicator={false}>

          {!readOnly && !bannerDismissed && (
            <View
              style={[
                styles.introCard,
                {
                  backgroundColor: palette.backgroundColor4,
                  borderColor: ColorUtils.withAlpha(palette.primary, 0.12),
                  ...palette.shadows[100],
                },
              ]}
            >
              <View
                style={[
                  styles.introIconWrap,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1) },
                ]}
              >
                <MaterialCommunityIcons name='music-note-eighth' size={18} color={palette.primary} />
              </View>
              <View style={styles.introTextBlock}>
                <FancyText size='small' type='bold'>
                  Base da música
                </FancyText>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Organize identidade, categoria e referência musical antes de completar letra e cifra.
                </FancyText>
              </View>
              <FancyButton
                type='text'
                mode='icon'
                size={28}
                icon={{ library: 'MaterialCommunityIcons', name: 'close', size: 16, color: palette.fonts.inactive }}
                containerStyle={styles.introDismissBtn}
                onPress={() => setBannerDismissed(true)}
                accessibilityLabel='Fechar aviso'
              />
            </View>
          )}

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: palette.backgroundColor,
                borderColor: ColorUtils.withAlpha(palette.borderCard, 0.72),
                ...palette.shadows[100],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <FancyText size='small' type='bold'>
                  Identidade
                </FancyText>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Nome, intérprete e origem da versão.
                </FancyText>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <FancyTextInput label='Nome da música' value={nome} disabled={!canEditRepertorio} inputProps={{ onChangeText: setNome }} />
              <FancyTextInput label='Intérprete' value={interprete} disabled={!canEditRepertorio} inputProps={{ onChangeText: setInterprete }} />

              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <View style={styles.fieldHeaderInfo}>
                    <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                      Categoria
                    </FancyText>
                  </View>
                  {canEditRepertorio ? (
                    <FancyButton
                      label='Gerenciar'
                      type='outlined'
                      size={24}
                      icon={{ library: 'MaterialCommunityIcons', name: 'tune-variant', size: 12 }}
                      iconPosition='left'
                      labelProps={{ size: 10 }}
                      containerStyle={{ gap: 4, borderWidth: 1 }}
                      onPress={() => setCategoriasVisible(true)}
                    />
                  ) : null}
                </View>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive2} style={styles.fieldHelperText}>
                  Organize esta música no repertório.
                </FancyText>
                <FancyBottomSheetSelect
                  containerStyle={styles.fullWidthField}
                  title='Categoria'
                  value={categoriaId}
                  onChange={(value) => setCategoriaId(String(value || ''))}
                  listItems={categoryOptions}
                  disabled={!canEditRepertorio}
                />
              </View>

              <FancyTextInput
                label='Link da versão'
                value={versaoUrl}
                disabled={!canEditRepertorio}
                inputProps={{ onChangeText: setVersaoUrl }}
                rightContainer={
                  <View style={styles.versaoUrlIcons}>
                    <TouchableOpacity
                      onPress={canEditRepertorio ? () => setYoutubeSearchVisible(true) : undefined}
                      style={styles.versaoUrlIconButton}
                    >
                      <MaterialCommunityIcons
                        name='youtube'
                        size={20}
                        color={canEditRepertorio ? palette.primary : palette.icons.inactive2}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={versaoUrlNormalizada ? () => Linking.openURL(versaoUrlNormalizada) : undefined}
                      style={styles.versaoUrlIconButton}
                    >
                      <MaterialCommunityIcons
                        name='web'
                        size={15}
                        color={versaoUrlNormalizada ? palette.primary : palette.icons.inactive2}
                      />
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: palette.backgroundColor,
                borderColor: ColorUtils.withAlpha(palette.borderCard, 0.72),
                ...palette.shadows[100],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <FancyText size='small' type='bold'>
                  Referência musical
                </FancyText>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Ajustes originais usados pela equipe.
                </FancyText>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.inlineRow}>
                <FancyBottomSheetSelect
                  containerStyle={{ flex: 1 }}
                  label='Tom original'
                  title='Tom original'
                  value={tomOriginal}
                  onChange={(value) => setTomOriginal(String(value || ''))}
                  listItems={toneOptions}
                  disabled={!canEditRepertorio}
                />
                <FancyBpmField
                  containerStyle={{ flex: 1 }}
                  label='BPM original'
                  title='BPM original'
                  value={bpmOriginal}
                  onChange={setBpmOriginal}
                  min={0}
                  max={300}
                  disabled={!canEditRepertorio}
                />
              </View>
              <FancyTextInput
                label='Observações'
                value={observacoes}
                disabled={!canEditRepertorio}
                inputProps={{ onChangeText: setObservacoes, multiline: true, style: { minHeight: 100, textAlignVertical: 'top' } }}
              />
            </View>
          </View>
        </FancyScrollView>
      ),
    },
    {
      title: 'Letra',
      icon: { library: 'Entypo', name: 'text', size: 16 },
      content: canEditRepertorio ? (
        <FancyScrollView fill contentContainerStyle={styles.markdownTabContent} showsVerticalScrollIndicator={false}>
          <SongTextEditorField
            label='Letra'
            value={letraMarkdown}
            onChange={setLetraMarkdown}
            placeholder='Digite a letra da música...'
          />
        </FancyScrollView>
      ) : renderSongTextReadOnly('Letra', letraMarkdown),
    },
    {
      title: 'Cifra',
      icon: { library: 'MaterialCommunityIcons', name: 'music-clef-treble', size: 18 },
      content: canEditRepertorio ? (
        <FancyScrollView fill contentContainerStyle={styles.markdownTabContent} showsVerticalScrollIndicator={false}>
          <SongTextEditorField
            label='Cifra'
            value={cifraMarkdown}
            onChange={setCifraMarkdown}
            placeholder='Digite a cifra da música...'
          />
        </FancyScrollView>
      ) : renderSongTextReadOnly('Cifra', cifraMarkdown),
    },
  ];

  if ((musicaId && musicaQuery.isLoading) || !ministerioId) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={tabs}
      />
      {canEditRepertorio ? (
        <FancyButton
          label='Salvar'
          loadingText='Salvando...'
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          isLoading={isMutatingMusica}
          containerStyle={styles.saveButton}
          disabled={!canEditRepertorio}
          onPress={() => {
            void handleSave();
          }}
        />
      ) : null}
      {canEditRepertorio ? (
        <RepertorioCategoriasManagerSheet visible={categoriasVisible} onClose={() => setCategoriasVisible(false)} />
      ) : null}
      <YoutubeVersionSearchSheet
        visible={youtubeSearchVisible}
        onClose={() => setYoutubeSearchVisible(false)}
        initialQuery={youtubeInitialQuery}
        onSelect={handleYoutubeVersionSelect}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 16, gap: 12 },
  formSection: { gap: 14, paddingTop: 8, paddingBottom: 32 },
  markdownTabContent: { flexGrow: 1, paddingTop: 8, paddingBottom: 20 },
  readOnlyTextContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
  },
  readOnlyText: {
    lineHeight: 23,
    paddingHorizontal: 2,
  },
  readOnlyChordText: {
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  songReadHeader: {
    gap: 8,
    paddingBottom: 4,
  },
  songReadMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  songReadMetaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  emptySongText: {
    flex: 1,
    minHeight: 260,
    justifyContent: 'center',
  },
  introCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTextBlock: {
    flex: 1,
    gap: 2,
  },
  introDismissBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  cardHeader: {
    gap: 2,
  },
  cardHeaderText: {
    gap: 2,
  },
  sectionBlock: {
    gap: 14,
  },
  fieldBlock: { gap: 4 },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 2,
  },
  fieldHeaderInfo: {
    flex: 1,
    gap: 1,
  },
  fieldHelperText: { paddingLeft: 2 },
  fullWidthField: { width: '100%' },
  inlineRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  versaoUrlIcons: { flexDirection: 'row', alignItems: 'center', gap: 12, height: '100%' },
  versaoUrlIconButton: { justifyContent: 'center', alignItems: 'center' },
  saveButton: { marginHorizontal: 20, height: 44, marginTop: 4 },
});
