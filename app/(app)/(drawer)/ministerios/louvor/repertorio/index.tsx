import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FancyScrollView from '../../../../../../components/FancyScrollView';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FancyListPage from '../../../../../../components/pages/base/FancyBaseListPage';
import FancyLoading from '../../../../../../components/FancyLoading';
import FancyListItemCard from '../../../../../../components/cards/FancyListItemCard';
import FancyText from '../../../../../../components/FancyText';
import FancyHeaderButton from '../../../../../../components/header/FancyHeaderButton';
import NotificationButton from '../../../../../../components/header/NotificationButton';
import FancyTabs, { TabItem } from '../../../../../../components/tabs/FancyTabs';
import MusicasTocadasInsightsView from '../../../../../../components/pages/ministerios/louvor/repertorio/MusicasTocadasInsightsView';
import RepertorioEtiquetasScreen from '../../../../../../components/pages/ministerios/louvor/repertorio/RepertorioEtiquetasScreen';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../../../domain/enums/Igreja/voluntario-role.enum';
import { MinisterioTipoEnum } from '../../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import {
  useRepertorioEtiquetas,
  useRepertorioMusicas,
} from '../../../../../../hooks/useRepertorio';
import { usePallete } from '../../../../../../hooks/usePallete';
import { DefaultIconsNames } from '../../../../../../constants/icons';
import DefaultIcons from '../../../../../../components/FancyIcons';
import { ColorUtils } from '../../../../../../utils/color_utils';
import FancyActionSheet from '../../../../../../components/actions/FancyActionSheet';
import { ResponseRepertorioMusicaDto } from '../../../../../../domain/dtos/Repertorio/repertorio-musica.response';
import { useLoading } from '../../../../../../contexts/LoadingContext';
import { getApiErrorMessage } from '../../../../../../domain/api/api-error';
import { FancyAlert } from '../../../../../../components/modal/FancyAlert';
import Toast from 'react-native-toast-message';
import { formatDataInclusaoRelativa } from '../../../../../../utils/date_utils';

type OrdenacaoRepertorio = 'nome' | 'dataInclusao';

const HEADER_ICON_SIZE = 19;

export default function MinisterioLouvorRepertorioIndexPage() {
  const params = useLocalSearchParams<{ ministerioId?: string; etiquetaId?: string }>();
  const palette = usePallete();
  const { igrejaAtiva } = useAuth();
  const ministerioId =
    params.ministerioId ||
    igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)
      ?.id;
  const ministerioAtual = igrejaAtiva?.ministerios?.find(
    (ministerio) => ministerio.id === ministerioId,
  );
  const { data: etiquetas = [] } = useRepertorioEtiquetas(ministerioId);
  const { data: musicas = [], removerMusica, isLoading } = useRepertorioMusicas(ministerioId);
  const { showLoading, hideLoading } = useLoading();
  const [search, setSearch] = useState('');
  const [etiquetaIds, setEtiquetaIds] = useState<string[]>(
    params.etiquetaId ? [params.etiquetaId] : [],
  );
  const [actionsMusica, setActionsMusica] = useState<ResponseRepertorioMusicaDto | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoRepertorio>('nome');
  const [ordenacaoVisible, setOrdenacaoVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const canManageRepertorio = useMemo(() => {
    if (igrejaAtiva?.role === IgrejaVoluntarioRoleEnum.ADMIN) return true;

    const hierarquia = ministerioAtual?.hierarquia?.toString();
    if (hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1') {
      return true;
    }

    return (ministerioAtual?.permissoes ?? []).some(
      (item) =>
        item.recurso === RecursoPermissaoEnum.RepertorioSetlist &&
        item.permissoes?.includes(TipoPermissaoEnum.Gerenciar),
    );
  }, [igrejaAtiva?.role, ministerioAtual]);

  const etiquetasAtivas = useMemo(
    () => etiquetas.filter((item) => item.ativo !== false),
    [etiquetas],
  );

  const toggleEtiquetaId = (id: string) => {
    setEtiquetaIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const filtered = useMemo(
    () =>
      musicas
        .filter((item) => item.ativo !== false)
        .filter((item) =>
          etiquetaIds.length === 0
            ? true
            : item.etiquetas?.some((etiqueta) => etiquetaIds.includes(etiqueta.id)),
        )
        .filter((item) => {
          const nomesEtiquetas = (item.etiquetas ?? []).map((etiqueta) => etiqueta.nome).join(' ');
          const haystack = `${item.nome} ${item.interprete || ''} ${nomesEtiquetas}`.toLowerCase();
          return haystack.includes(search.trim().toLowerCase());
        })
        .sort((a, b) =>
          ordenacao === 'dataInclusao'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : a.nome.localeCompare(b.nome, 'pt-BR'),
        ),
    [etiquetaIds, musicas, ordenacao, search],
  );

  const openMusica = (id: string) => {
    router.push({
      pathname: '/ministerios/louvor/repertorio/edit',
      params: {
        id,
        ministerioId,
        readOnly: canManageRepertorio ? '0' : '1',
      },
    });
  };

  const handleExcluirMusica = (musica: ResponseRepertorioMusicaDto) => {
    FancyAlert.alert(
      'Excluir música',
      `Tem certeza que deseja excluir "${musica.nome}" do repertório?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            showLoading('Excluindo...');
            try {
              await removerMusica(musica.id);
              Toast.show({ type: 'success', text1: 'Música excluída com sucesso!' });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erro ao excluir música',
                text2: getApiErrorMessage(
                  error,
                  'Não foi possível excluir a música do repertório.',
                ),
              });
            } finally {
              hideLoading();
            }
          },
        },
      ],
    );
  };

  if (isLoading) return <FancyLoading label='Carregando...' />;
  if (!ministerioId) return null;

  const repertorioContent = (
    <FancyListPage
      showFab={canManageRepertorio}
      showSearchBar
      searchBarProps={{
        value: search,
        onSearch: setSearch,
      }}
      listProps={{
        listEmptyProps: {
          label: 'Nenhuma música no repertório',
          icon: { library: 'MaterialIcons', name: 'queue-music', size: 68 },
        },
        ListHeaderComponent: (
          <View style={styles.filtersSection}>
            <FancyScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bottomFade={{ active: false }}
              topFade={{ active: false }}
              contentContainerStyle={styles.categoryChipsRow}
            >
              <Pressable
                onPress={() => setEtiquetaIds([])}
                style={[
                  styles.etiquetaChip,
                  {
                    backgroundColor:
                      etiquetaIds.length === 0
                        ? palette.primary
                        : ColorUtils.darkenColor(palette.primary, 0.35),
                  },
                ]}
              >
                <FancyText type='bold' size={10} color={palette.fonts.light} numberOfLines={1}>
                  Todas
                </FancyText>
              </Pressable>
              {etiquetasAtivas.map((item) => {
                const selected = etiquetaIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleEtiquetaId(item.id)}
                    style={[
                      styles.etiquetaChip,
                      {
                        backgroundColor: selected
                          ? item.cor
                          : ColorUtils.darkenColor(item.cor, 0.35),
                      },
                    ]}
                  >
                    {selected ? (
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='check'
                        size={12}
                        color={palette.fonts.light}
                      />
                    ) : null}
                    <FancyText type='bold' size={10} color={palette.fonts.light} numberOfLines={1}>
                      {item.nome}
                    </FancyText>
                  </Pressable>
                );
              })}
            </FancyScrollView>
          </View>
        ),
        data: filtered,
        renderItem: ({ item }) => {
          const hasBadges = Boolean(item.etiquetas?.length || item.tomOriginal || item.bpmOriginal);
          const dataInclusao = formatDataInclusaoRelativa(item.createdAt);
          return (
            <FancyListItemCard
              onPress={() => openMusica(item.id)}
              leading={{
                type: 'icon',
                icon: { library: 'MaterialIcons', name: 'queue-music', size: 20 },
                color: palette.primary,
                backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
              }}
              title={item.nome}
              subtitle={item.interprete || 'Sem intérprete'}
              meta={
                hasBadges || dataInclusao ? (
                  <View>
                    {hasBadges ? (
                      <View style={styles.musicBadgesRow}>
                        {(item.etiquetas ?? []).map((etiqueta) => (
                          <MusicBadge
                            key={etiqueta.id}
                            label={etiqueta.nome}
                            color={etiqueta.cor}
                            icon='shape-outline'
                          />
                        ))}
                        {item.tomOriginal ? (
                          <MusicBadge
                            label={`TOM ${item.tomOriginal}`}
                            color={palette.secondary}
                            icon='music-clef-treble'
                          />
                        ) : null}
                        {item.bpmOriginal ? (
                          <MusicBadge
                            label={`BPM ${item.bpmOriginal}`}
                            color={palette.terciary}
                            icon='metronome'
                          />
                        ) : null}
                      </View>
                    ) : null}
                    {dataInclusao ? (
                      <FancyText
                        type='medium'
                        size='extraSmall'
                        color={palette.fonts.inactive}
                        style={styles.dataInclusaoText}
                      >
                        {dataInclusao}
                      </FancyText>
                    ) : null}
                  </View>
                ) : undefined
              }
              trailing={
                canManageRepertorio
                  ? { type: 'menu', onPress: () => setActionsMusica(item) }
                  : { type: 'chevron', onPress: () => openMusica(item.id) }
              }
            />
          );
        },
      }}
      fabProps={
        canManageRepertorio
          ? {
              onPress: () => {
                router.push({
                  pathname: '/ministerios/louvor/repertorio/add',
                  params: { ministerioId },
                });
              },
            }
          : undefined
      }
    />
  );

  const tabs: TabItem[] = canManageRepertorio
    ? [
        { title: 'Repertório', content: repertorioContent },
        {
          title: 'Insights',
          content: <MusicasTocadasInsightsView ministerioId={ministerioId} />,
        },
        {
          title: 'Etiquetas',
          content: <RepertorioEtiquetasScreen ministerioId={ministerioId} />,
        },
      ]
    : [];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtonsRow}>
              {activeTabIndex === 0 ? (
                <FancyHeaderButton
                  icon={{ library: 'MaterialCommunityIcons', name: 'sort', size: HEADER_ICON_SIZE }}
                  onPress={() => setOrdenacaoVisible(true)}
                />
              ) : null}
              <NotificationButton />
            </View>
          ),
        }}
      />
      {canManageRepertorio ? (
        <FancyTabs items={tabs} contentGutter={false} onTabChange={setActiveTabIndex} />
      ) : (
        repertorioContent
      )}
      <FancyActionSheet
        visible={ordenacaoVisible}
        onClose={() => setOrdenacaoVisible(false)}
        actions={[
          {
            label: 'Nome (A-Z)',
            icon: {
              library: 'MaterialCommunityIcons',
              name: 'sort-alphabetical-ascending',
              size: 18,
            },
            onPress: () => setOrdenacao('nome'),
          },
          {
            label: 'Data de inclusão',
            icon: {
              library: 'MaterialCommunityIcons',
              name: 'sort-clock-descending-outline',
              size: 18,
            },
            onPress: () => setOrdenacao('dataInclusao'),
          },
        ]}
      />
      <FancyActionSheet
        visible={!!actionsMusica}
        onClose={() => setActionsMusica(null)}
        actions={[
          {
            label: 'Abrir detalhes',
            icon: { ...DefaultIconsNames.edit, size: 18 },
            onPress: () => {
              if (!actionsMusica) return;
              router.push({
                pathname: '/ministerios/louvor/repertorio/edit',
                params: { id: actionsMusica.id, ministerioId },
              });
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            icon: { ...DefaultIconsNames.delete, size: 18 },
            onPress: () => {
              if (actionsMusica) handleExcluirMusica(actionsMusica);
            },
          },
        ]}
      />
    </>
  );
}

function MusicBadge({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View
      style={[
        styles.musicBadge,
        {
          backgroundColor: ColorUtils.withAlpha(color, 0.1),
          borderColor: ColorUtils.withAlpha(color, 0.22),
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={11} color={color} style={styles.musicBadgeIcon} />
      <FancyText
        type='bold'
        size='extraSmall'
        numberOfLines={1}
        color={color}
        style={styles.musicBadgeText}
      >
        {label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersSection: {
    gap: 10,
    paddingBottom: 0,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etiquetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  musicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    height: 22,
    borderRadius: 999,
    borderWidth: 0.6,
    gap: 4,
    maxWidth: '100%',
  },
  musicBadgeIcon: {
    marginTop: -1,
  },
  musicBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  dataInclusaoText: {
    marginTop: 4,
  },
});
