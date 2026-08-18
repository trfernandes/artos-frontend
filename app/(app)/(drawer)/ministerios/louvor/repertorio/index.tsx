import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FancyListPage from '../../../../../../components/pages/base/FancyBaseListPage';
import FancyLoading from '../../../../../../components/FancyLoading';
import FancyListItemCard from '../../../../../../components/cards/FancyListItemCard';
import FancyChips from '../../../../../../components/FancyChips';
import FancyButton from '../../../../../../components/buttons/FancyButton';
import FancyText from '../../../../../../components/FancyText';
import RepertorioCategoriasManagerSheet from '../../../../../../components/pages/ministerios/louvor/repertorio/RepertorioCategoriasManagerSheet';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../../../domain/enums/Igreja/voluntario-role.enum';
import { MinisterioTipoEnum } from '../../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import {
  useRepertorioCategorias,
  useRepertorioMusicas,
} from '../../../../../../hooks/useRepertorio';
import { usePallete } from '../../../../../../hooks/usePallete';
import { DefaultIconsNames } from '../../../../../../constants/icons';
import { ColorUtils } from '../../../../../../utils/color_utils';
import FancyActionSheet from '../../../../../../components/actions/FancyActionSheet';
import { ResponseRepertorioMusicaDto } from '../../../../../../domain/dtos/Repertorio/repertorio-musica.response';
import { useLoading } from '../../../../../../contexts/LoadingContext';
import { getApiErrorMessage } from '../../../../../../domain/api/api-error';
import { FancyAlert } from '../../../../../../components/modal/FancyAlert';
import Toast from 'react-native-toast-message';

export default function MinisterioLouvorRepertorioIndexPage() {
  const params = useLocalSearchParams<{ ministerioId?: string }>();
  const palette = usePallete();
  const { igrejaAtiva } = useAuth();
  const ministerioId =
    params.ministerioId ||
    igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)
      ?.id;
  const ministerioAtual = igrejaAtiva?.ministerios?.find(
    (ministerio) => ministerio.id === ministerioId,
  );
  const { data: categorias = [] } = useRepertorioCategorias(ministerioId);
  const { data: musicas = [], removerMusica, isLoading } = useRepertorioMusicas(ministerioId);
  const { showLoading, hideLoading } = useLoading();
  const [search, setSearch] = useState('');
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [categoriasVisible, setCategoriasVisible] = useState(false);
  const [actionsMusica, setActionsMusica] = useState<ResponseRepertorioMusicaDto | null>(null);

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

  const categoriasAtivas = useMemo(
    () => categorias.filter((item) => item.ativo !== false),
    [categorias],
  );

  const toggleCategoriaId = (id: string) => {
    setCategoriaIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const filtered = useMemo(
    () =>
      musicas
        .filter((item) => item.ativo !== false)
        .filter((item) =>
          categoriaIds.length === 0 ? true : categoriaIds.includes(item.categoriaId),
        )
        .filter((item) => {
          const haystack =
            `${item.nome} ${item.interprete || ''} ${item.categoria?.nome || ''}`.toLowerCase();
          return haystack.includes(search.trim().toLowerCase());
        }),
    [categoriaIds, musicas, search],
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

  return (
    <>
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsRow}
              >
                <FancyChips
                  label='Todas'
                  size='medium'
                  outlined={categoriaIds.length > 0}
                  onPress={() => setCategoriaIds([])}
                />
                {categoriasAtivas.map((item) => (
                  <FancyChips
                    key={item.id}
                    label={item.nome}
                    size='medium'
                    outlined={!categoriaIds.includes(item.id)}
                    onPress={() => toggleCategoriaId(item.id)}
                  />
                ))}
              </ScrollView>
              {canManageRepertorio ? (
                <FancyButton
                  label='Gerenciar categorias'
                  type='light'
                  size={34}
                  icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 16 }}
                  containerStyle={styles.categoriesButton}
                  onPress={() => setCategoriasVisible(true)}
                />
              ) : null}
            </View>
          ),
          data: filtered,
          renderItem: ({ item }) => {
            const hasBadges = Boolean(item.categoria?.nome || item.tomOriginal || item.bpmOriginal);
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
                  hasBadges ? (
                    <View style={styles.musicBadgesRow}>
                      {item.categoria?.nome ? (
                        <MusicBadge
                          label={item.categoria.nome}
                          color={palette.primary}
                          icon='shape-outline'
                        />
                      ) : null}
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
      {canManageRepertorio ? (
        <RepertorioCategoriasManagerSheet
          visible={categoriasVisible}
          onClose={() => setCategoriasVisible(false)}
          ministerioId={ministerioId}
        />
      ) : null}
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
    gap: 8,
    paddingRight: 4,
  },
  categoriesButton: {
    alignSelf: 'flex-start',
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
});
