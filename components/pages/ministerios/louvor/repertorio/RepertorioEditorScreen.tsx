import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FancyAlert } from '../../../../modal/FancyAlert';
import FancyBottomSheetSelect from '../../../../fields/FancyBottomSheetSelect';
import FancyButton from '../../../../buttons/FancyButton';
import FancyPageView from '../../../../containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyLoading from '../../../../FancyLoading';
import SongTextEditorField from '../../../../song/SongTextEditorField';
import RepertorioCategoriasManagerSheet from './RepertorioCategoriasManagerSheet';
import { useAuth } from '../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { useRepertorioCategorias, useRepertorioMusicas } from '../../../../../hooks/useRepertorio';
import { RepertorioRepository } from '../../../../../domain/services/RepertorioRepository';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';

const TONS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

type Props = {
  ministerioId?: string;
  musicaId?: string;
  onSaved?: () => void;
};

export default function RepertorioEditorScreen({ ministerioId: ministerioIdProp, musicaId, onSaved }: Props) {
  const { igrejaAtiva } = useAuth();
  const palette = usePallete();
  const fallbackMinisterioId = igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)?.id;
  const ministerioId = ministerioIdProp || fallbackMinisterioId;
  const { data: categorias = [] } = useRepertorioCategorias();
  const { criarMusica, atualizarMusica, isMutatingMusica } = useRepertorioMusicas(ministerioId);
  const [categoriasVisible, setCategoriasVisible] = useState(false);

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
  const [bpmOriginal, setBpmOriginal] = useState(musica?.bpmOriginal ? String(musica.bpmOriginal) : '');
  const [letraMarkdown, setLetraMarkdown] = useState(musica?.letraMarkdown || '');
  const [cifraMarkdown, setCifraMarkdown] = useState(musica?.cifraMarkdown || '');
  const [observacoes, setObservacoes] = useState(musica?.observacoes || '');

  useEffect(() => {
    if (!musica) return;
    setNome(musica.nome || '');
    setInterprete(musica.interprete || '');
    setVersaoUrl(musica.versaoUrl || '');
    setCategoriaId(musica.categoriaId || '');
    setTomOriginal(musica.tomOriginal || '');
    setBpmOriginal(musica.bpmOriginal ? String(musica.bpmOriginal) : '');
    setLetraMarkdown(musica.letraMarkdown || '');
    setCifraMarkdown(musica.cifraMarkdown || '');
    setObservacoes(musica.observacoes || '');
  }, [musica]);

  const categoryOptions = useMemo(
    () => categorias.filter((item) => item.ativo !== false).map((categoria) => ({ title: categoria.nome, value: categoria.id })),
    [categorias],
  );
  const toneOptions = useMemo(() => TONS.map((tone) => ({ title: tone, value: tone })), []);
  const versaoUrlNormalizada = useMemo(() => {
    const rawUrl = versaoUrl.trim();
    if (!rawUrl) return '';
    return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  }, [versaoUrl]);

  const handleSave = async () => {
    if (!igrejaAtiva?.id || !ministerioId) return;
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
        bpmOriginal: bpmOriginal ? Number(bpmOriginal) : undefined,
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

  const tabs: TabItem[] = [
    {
      title: 'Dados',
      icon: { library: 'Feather', name: 'info', size: 16 },
      content: (
        <View style={styles.formSection}>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <FancyText size='small' type='bold'>
                Identificação
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                Dados base da música
              </FancyText>
            </View>
          <FancyTextInput label='Nome da música' value={nome} inputProps={{ onChangeText: setNome }} />
          <FancyTextInput label='Intérprete' value={interprete} inputProps={{ onChangeText: setInterprete }} />
          <View style={styles.fieldBlock}>
            <View style={styles.fieldHeaderRow}>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Categoria
              </FancyText>
              <FancyButton
                label='Gerenciar'
                type='text'
                size={28}
                icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 14, color: palette.primary }}
                iconPosition='left'
                labelProps={{ size: 'extraSmall' }}
                labelStyle={styles.categoryManageLinkLabel}
                containerStyle={styles.categoryManageLink}
                onPress={() => setCategoriasVisible(true)}
              />
            </View>
            <FancyBottomSheetSelect
              containerStyle={styles.fullWidthField}
              title='Categoria'
              value={categoriaId}
              onChange={(value) => setCategoriaId(String(value || ''))}
              listItems={categoryOptions}
            />
          </View>
          <FancyTextInput
            label='Link da versão'
            value={versaoUrl}
            inputProps={{ onChangeText: setVersaoUrl }}
            rightContainer={[
              {
                icon: {
                  library: 'Feather',
                  name: 'external-link',
                  size: 18,
                  color: versaoUrlNormalizada ? palette.primary : palette.icons.inactive2,
                },
                onPress: versaoUrlNormalizada ? () => Linking.openURL(versaoUrlNormalizada) : undefined,
              },
            ]}
          />
          </View>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <FancyText size='small' type='bold'>
                Referência musical
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                Ajustes originais e observações
              </FancyText>
            </View>
          <View style={styles.inlineRow}>
            <FancyBottomSheetSelect
              containerStyle={{ flex: 1 }}
              label='Tom original'
              title='Tom original'
              value={tomOriginal}
              onChange={(value) => setTomOriginal(String(value || ''))}
              listItems={toneOptions}
            />
            <FancyTextInput
              label='BPM original'
              containerStyle={{ flex: 1 }}
              value={bpmOriginal}
              inputProps={{ keyboardType: 'numeric', onChangeText: setBpmOriginal }}
            />
          </View>
          <FancyTextInput
            label='Observações'
            value={observacoes}
            inputProps={{ onChangeText: setObservacoes, multiline: true, style: { minHeight: 100, textAlignVertical: 'top' } }}
          />
          </View>
        </View>
      ),
    },
    {
      title: 'Letra',
      icon: { library: 'Entypo', name: 'text', size: 16 },
      content: (
        <View style={styles.markdownTabContent}>
          <SongTextEditorField label='Letra' value={letraMarkdown} onChange={setLetraMarkdown} placeholder='Digite a letra da música...' />
        </View>
      ),
    },
    {
      title: 'Cifra',
      icon: { library: 'MaterialCommunityIcons', name: 'music-clef-treble', size: 18 },
      content: (
        <View style={styles.markdownTabContent}>
          <SongTextEditorField label='Cifra' value={cifraMarkdown} onChange={setCifraMarkdown} placeholder='Digite a cifra da música...' />
        </View>
      ),
    },
  ];

  if ((musicaId && musicaQuery.isLoading) || !ministerioId) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={tabs}
        containerStyle={{ flex: 1 }}
        headerStyle={styles.tabsHeader}
        contentContainerStyle={{ flex: 1, paddingHorizontal: 20 }}
      />
      <FancyButton
        label='Salvar'
        isLoading={isMutatingMusica}
        containerStyle={styles.saveButton}
        onPress={() => {
          void handleSave();
        }}
      />
      <RepertorioCategoriasManagerSheet visible={categoriasVisible} onClose={() => setCategoriasVisible(false)} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 16, gap: 12 },
  tabsHeader: { paddingHorizontal: 20 },
  formSection: { gap: 14, paddingTop: 8 },
  markdownTabContent: { flex: 1, paddingTop: 8 },
  sectionBlock: {
    gap: 14,
  },
  sectionHeader: { gap: 2, paddingLeft: 2 },
  fieldBlock: { gap: 7 },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 2,
  },
  fullWidthField: { width: '100%' },
  inlineRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  saveButton: { marginHorizontal: 20, height: 44 },
  categoryManageLink: {
    minWidth: 0,
    paddingHorizontal: 0,
  },
  categoryManageLinkLabel: { marginLeft: -4 },
});
