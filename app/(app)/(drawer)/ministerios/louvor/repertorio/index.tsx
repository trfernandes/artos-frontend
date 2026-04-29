import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FancyListPage from '../../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../../components/cards/Horizontal/FancyCard';
import FancyBottomSheetSelect from '../../../../../../components/fields/FancyBottomSheetSelect';
import FancyButton from '../../../../../../components/buttons/FancyButton';
import RepertorioCategoriasManagerSheet from '../../../../../../components/pages/ministerios/louvor/repertorio/RepertorioCategoriasManagerSheet';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { RecursoPermissaoEnum, TipoPermissaoEnum } from '../../../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { useRepertorioCategorias, useRepertorioMusicas } from '../../../../../../hooks/useRepertorio';
import { usePallete } from '../../../../../../hooks/usePallete';
import { DefaultIconsNames } from '../../../../../../constants/icons';

export default function MinisterioLouvorRepertorioIndexPage() {
  const params = useLocalSearchParams<{ ministerioId?: string }>();
  const palette = usePallete();
  const { igrejaAtiva } = useAuth();
  const ministerioId = params.ministerioId || igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)?.id;
  const ministerioAtual = igrejaAtiva?.ministerios?.find((ministerio) => ministerio.id === ministerioId);
  const { data: categorias = [] } = useRepertorioCategorias();
  const { data: musicas = [], removerMusica } = useRepertorioMusicas(ministerioId);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categoriasVisible, setCategoriasVisible] = useState(false);

  const canManageRepertorio = useMemo(() => {
    const hierarquia = ministerioAtual?.hierarquia?.toString();
    if (hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1') {
      return true;
    }

    return (ministerioAtual?.permissoes ?? []).some(
      (item) => item.recurso === RecursoPermissaoEnum.RepertorioSetlist && item.permissoes?.includes(TipoPermissaoEnum.Gerenciar),
    );
  }, [ministerioAtual]);

  const categoryOptions = useMemo(
    () => [{ title: 'Todas', value: '' }, ...categorias.filter((item) => item.ativo !== false).map((item) => ({ title: item.nome, value: item.id }))],
    [categorias],
  );

  const filtered = useMemo(
    () =>
      musicas
        .filter((item) => item.ativo !== false)
        .filter((item) => (!categoriaId ? true : item.categoriaId === categoriaId))
        .filter((item) => {
          const haystack = `${item.nome} ${item.interprete || ''} ${item.categoria?.nome || ''}`.toLowerCase();
          return haystack.includes(search.trim().toLowerCase());
        }),
    [categoriaId, musicas, search],
  );

  return (
    <>
      <FancyListPage
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
            <FancyBottomSheetSelect
              containerStyle={styles.categorySelect}
              title='Categoria'
              value={categoriaId}
              onChange={(value) => setCategoriaId(String(value || ''))}
              listItems={categoryOptions}
            />
            <FancyButton
              label='Gerenciar categorias'
              type='light'
              size={34}
              icon={{ library: 'MaterialCommunityIcons', name: 'shape-outline', size: 16 }}
              containerStyle={styles.categoriesButton}
              onPress={() => setCategoriasVisible(true)}
              disabled={!canManageRepertorio}
            />
          </View>
        ),
        data: filtered,
        renderItem: ({ item }) => (
          <FancyCard.Image
            type='icon'
            props={{
              title: item.nome,
              subtitle: item.interprete || 'Sem intérprete',
              additionalData1: item.categoria?.nome,
              additionalData2: [item.tomOriginal ? `Tom ${item.tomOriginal}` : null, item.bpmOriginal ? `${item.bpmOriginal} bpm` : null]
                .filter(Boolean)
                .join(' • '),
              cardIcon: { library: 'MaterialIcons', name: 'queue-music', size: 20 },
              actionButtons: [
                ...(canManageRepertorio
                  ? [
                      {
                        icon: { ...DefaultIconsNames.edit, size: 18 },
                        onPress: () => {
                          router.push({
                            pathname: '/ministerios/louvor/repertorio/edit',
                            params: { id: item.id, ministerioId },
                          });
                        },
                      },
                      {
                        icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: palette.error },
                        onPress: () => {
                          void removerMusica(item.id);
                        },
                      },
                    ]
                  : []),
              ],
            }}
          />
        ),
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
      <RepertorioCategoriasManagerSheet visible={categoriasVisible} onClose={() => setCategoriasVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  filtersSection: {
    gap: 10,
    paddingBottom: 6,
  },
  categorySelect: {
    width: '100%',
  },
  categoriesButton: {
    alignSelf: 'flex-start',
  },
});
