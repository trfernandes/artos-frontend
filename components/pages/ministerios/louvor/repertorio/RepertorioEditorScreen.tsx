import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import FancyBpmField from '../../../../fields/FancyBpmField';
import FancyButton from '../../../../buttons/FancyButton';
import FancyPageView from '../../../../containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import ControlledTextInput from '../../../../forms/ControlledTextInput';
import ControlledBottomSheetSelect from '../../../../forms/ControlledBottomSheetSelect';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyLoading from '../../../../FancyLoading';
import {
  RepertorioMusicaSchema,
  RepertorioMusicaFormData,
} from '../../../../../domain/schemas/repertorioMusicaSchema';
import FancyScrollView from '../../../../FancyScrollView';
import SongTextEditorField from '../../../../song/SongTextEditorField';
import RepertorioEtiquetasManagerSheet from './RepertorioEtiquetasManagerSheet';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { useRepertorioEtiquetas, useRepertorioMusicas } from '../../../../../hooks/useRepertorio';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { RepertorioRepository } from '../../../../../domain/services/RepertorioRepository';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import YoutubeVersionSearchSheet from '../../../common/YoutubeVersionSearchSheet';
import { ResponseYoutubeSearchItemDto } from '../../../../../domain/dtos/Repertorio/youtube-search-item.response';
import FancyListEmpty from '../../../../list/FancyListEmpty';

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

type Props = {
  ministerioId?: string;
  musicaId?: string;
  readOnly?: boolean;
  onSaved?: () => void;
};

export default function RepertorioEditorScreen({
  ministerioId: ministerioIdProp,
  musicaId,
  readOnly = false,
  onSaved,
}: Props) {
  const navigation = useNavigation<any>();
  const { igrejaAtiva } = useAuth();
  const palette = usePallete();
  const fallbackMinisterioId = igrejaAtiva?.ministerios?.find(
    (ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor,
  )?.id;
  const ministerioId = ministerioIdProp || fallbackMinisterioId;
  const ministerioAtual = igrejaAtiva?.ministerios?.find(
    (ministerio) => ministerio.id === ministerioId,
  );
  const { data: etiquetas = [] } = useRepertorioEtiquetas(ministerioId);
  const { criarMusica, atualizarMusica, isMutatingMusica } = useRepertorioMusicas(ministerioId);
  const { showLoading, hideLoading } = useLoading();
  const [etiquetasVisible, setEtiquetasVisible] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const canManageRepertorio = useMemo(() => {
    const hierarquia = ministerioAtual?.hierarquia?.toString();
    if (hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1') {
      return true;
    }
    return (ministerioAtual?.permissoes ?? []).some(
      (item) =>
        item.recurso === RecursoPermissaoEnum.RepertorioSetlist &&
        item.permissoes?.includes(TipoPermissaoEnum.Gerenciar),
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
  const [youtubeSearchVisible, setYoutubeSearchVisible] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } = useForm<RepertorioMusicaFormData>({
    resolver: zodResolver(RepertorioMusicaSchema),
    defaultValues: {
      nome: '',
      interprete: '',
      versaoUrl: '',
      etiquetaIds: [],
      tomOriginal: '',
      bpmOriginal: 0,
      letraMarkdown: '',
      cifraMarkdown: '',
      observacoes: '',
    },
  });

  const nome = watch('nome');
  const interprete = watch('interprete') ?? '';
  const versaoUrl = watch('versaoUrl') ?? '';
  const bpmOriginal = watch('bpmOriginal') ?? 0;
  const tomOriginal = watch('tomOriginal') ?? '';
  const letraMarkdown = watch('letraMarkdown') ?? '';
  const cifraMarkdown = watch('cifraMarkdown') ?? '';

  useEffect(() => {
    if (!musica) return;
    reset({
      nome: musica.nome || '',
      interprete: musica.interprete || '',
      versaoUrl: musica.versaoUrl || '',
      etiquetaIds: (musica.etiquetas ?? []).map((etiqueta) => etiqueta.id),
      tomOriginal: musica.tomOriginal || '',
      bpmOriginal: musica.bpmOriginal ?? 0,
      letraMarkdown: musica.letraMarkdown || '',
      cifraMarkdown: musica.cifraMarkdown || '',
      observacoes: musica.observacoes || '',
    });
  }, [musica, reset]);

  const etiquetaOptions = useMemo(
    () =>
      etiquetas
        .filter((item) => item.ativo !== false)
        .map((etiqueta) => ({ title: etiqueta.nome, value: etiqueta.id })),
    [etiquetas],
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
  const versaoUrlNormalizada = useMemo(() => {
    const rawUrl = versaoUrl.trim();
    if (!rawUrl) return '';
    return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  }, [versaoUrl]);

  const onSubmit = async (values: RepertorioMusicaFormData) => {
    if (!igrejaAtiva?.id || !ministerioId) return;
    if (!canEditRepertorio) {
      FancyAlert.alert(
        'Sem permissão',
        'Você pode visualizar o repertório, mas não possui permissão para editar músicas.',
      );
      return;
    }

    showLoading('Salvando...');
    try {
      const payload = {
        ministerioId,
        etiquetaIds: values.etiquetaIds,
        nome: values.nome.trim(),
        interprete: values.interprete?.trim() || undefined,
        versaoUrl: values.versaoUrl?.trim() || undefined,
        tomOriginal: values.tomOriginal || undefined,
        bpmOriginal: values.bpmOriginal && values.bpmOriginal > 0 ? values.bpmOriginal : undefined,
        letraMarkdown: values.letraMarkdown || undefined,
        cifraMarkdown: values.cifraMarkdown || undefined,
        observacoes: values.observacoes || undefined,
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
    } finally {
      hideLoading();
    }
  };

  const handleYoutubeVersionSelect = (selectedVideo: ResponseYoutubeSearchItemDto) => {
    setValue('versaoUrl', selectedVideo.watchUrl, { shouldDirty: true });
    if (!nome.trim()) {
      setValue('nome', selectedVideo.title, { shouldValidate: true });
    }
    if (!interprete.trim()) {
      setValue('interprete', selectedVideo.channelTitle, { shouldDirty: true });
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
      <FancyScrollView
        fill
        contentContainerStyle={styles.readOnlyTextContent}
        showsVerticalScrollIndicator={false}
      >
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
                <FancyText
                  size='extraSmall'
                  type='semiBold'
                  color={palette.fonts.inactive}
                  numberOfLines={1}
                >
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
              icon={{
                library: 'MaterialCommunityIcons',
                name: isCifra ? 'guitar-acoustic' : 'text-box-outline',
                size: 58,
              }}
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
        <FancyScrollView
          fill
          contentContainerStyle={styles.formSection}
          showsVerticalScrollIndicator={false}
        >
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
                <MaterialCommunityIcons
                  name='music-note-eighth'
                  size={18}
                  color={palette.primary}
                />
              </View>
              <View style={styles.introTextBlock}>
                <FancyText size='small' type='bold'>
                  Base da música
                </FancyText>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Organize identidade, categoria e referência musical antes de completar letra e
                  cifra.
                </FancyText>
              </View>
              <FancyButton
                type='text'
                mode='icon'
                size={28}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'close',
                  size: 16,
                  color: palette.fonts.inactive,
                }}
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
              <ControlledTextInput
                control={control}
                name='nome'
                label='Nome da música'
                disabled={!canEditRepertorio}
              />
              <ControlledTextInput
                control={control}
                name='interprete'
                label='Intérprete'
                disabled={!canEditRepertorio}
              />

              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <View style={styles.fieldHeaderInfo}>
                    <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                      Etiquetas
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
                      onPress={() => setEtiquetasVisible(true)}
                    />
                  ) : null}
                </View>
                <FancyText
                  size='extraSmall'
                  type='medium'
                  color={palette.fonts.inactive2}
                  style={styles.fieldHelperText}
                >
                  Organize esta música no repertório. Pode ter mais de uma etiqueta.
                </FancyText>
                <Controller
                  control={control}
                  name='etiquetaIds'
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <View style={{ gap: 5 }}>
                      <FancySearchSelect<string>
                        placeholder='Selecione uma ou mais etiquetas...'
                        listItems={etiquetaOptions}
                        value={value ?? []}
                        onChange={(selected) => onChange(selected)}
                        multiSelect
                        searchPlaceholder='Buscar etiqueta...'
                        disabled={!canEditRepertorio}
                      />
                      {error && <FancyErrorText message={error.message!} />}
                    </View>
                  )}
                />
              </View>

              <ControlledTextInput
                control={control}
                name='versaoUrl'
                label='Link da versão'
                disabled={!canEditRepertorio}
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
                      onPress={
                        versaoUrlNormalizada
                          ? () => Linking.openURL(versaoUrlNormalizada)
                          : undefined
                      }
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
                <View style={styles.inlineField}>
                  <ControlledBottomSheetSelect
                    control={control}
                    name='tomOriginal'
                    label='Tom original'
                    title='Tom original'
                    listItems={toneOptions}
                    disabled={!canEditRepertorio}
                  />
                </View>
                <FancyBpmField
                  containerStyle={{ flex: 1 }}
                  label='BPM original'
                  title='BPM original'
                  value={bpmOriginal}
                  onChange={(value) => setValue('bpmOriginal', value, { shouldDirty: true })}
                  min={0}
                  max={300}
                  disabled={!canEditRepertorio}
                />
              </View>
              <ControlledTextInput
                control={control}
                name='observacoes'
                label='Observações'
                disabled={!canEditRepertorio}
                inputProps={{
                  multiline: true,
                  style: { minHeight: 100, textAlignVertical: 'top' },
                }}
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
        <FancyScrollView
          fill
          contentContainerStyle={styles.markdownTabContent}
          showsVerticalScrollIndicator={false}
        >
          <SongTextEditorField
            label='Letra'
            value={letraMarkdown}
            onChange={(value) => setValue('letraMarkdown', value, { shouldDirty: true })}
            placeholder='Digite a letra da música...'
          />
        </FancyScrollView>
      ) : (
        renderSongTextReadOnly('Letra', letraMarkdown)
      ),
    },
    {
      title: 'Cifra',
      icon: { library: 'MaterialCommunityIcons', name: 'music-clef-treble', size: 18 },
      content: canEditRepertorio ? (
        <FancyScrollView
          fill
          contentContainerStyle={styles.markdownTabContent}
          showsVerticalScrollIndicator={false}
        >
          <SongTextEditorField
            label='Cifra'
            value={cifraMarkdown}
            onChange={(value) => setValue('cifraMarkdown', value, { shouldDirty: true })}
            placeholder='Digite a cifra da música...'
          />
        </FancyScrollView>
      ) : (
        renderSongTextReadOnly('Cifra', cifraMarkdown)
      ),
    },
  ];

  if ((musicaId && musicaQuery.isLoading) || !ministerioId) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={tabs} />
      {canEditRepertorio ? (
        <FancyButton
          label='Salvar'
          loadingText='Salvando...'
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          isLoading={isMutatingMusica}
          containerStyle={styles.saveButton}
          disabled={!canEditRepertorio}
          onPress={handleSubmit(onSubmit)}
        />
      ) : null}
      {canEditRepertorio ? (
        <RepertorioEtiquetasManagerSheet
          visible={etiquetasVisible}
          onClose={() => setEtiquetasVisible(false)}
          ministerioId={ministerioId}
        />
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
  inlineRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  inlineField: { flex: 1 },
  versaoUrlIcons: { flexDirection: 'row', alignItems: 'center', gap: 12, height: '100%' },
  versaoUrlIconButton: { justifyContent: 'center', alignItems: 'center' },
  saveButton: { marginHorizontal: 20, height: 44, marginTop: 4 },
});
