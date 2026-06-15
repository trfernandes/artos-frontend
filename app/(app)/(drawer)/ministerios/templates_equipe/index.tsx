import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import FancyListStats from '../../../../../components/list/FancyListStats';
import FancySegmentedControl from '../../../../../components/fields/FancySegmentedControl';
import FancyText from '../../../../../components/FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useCallback, useMemo, useState } from 'react';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import {
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
  EscalaTemplateTipoLabel,
  EscalaTemplateTipoEnumMap,
  EscalaTemplateTipoEnum,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { ResponseEscalaTemplateDto } from '../../../../../domain/dtos/EscalaTemplate/escala-template.response';

export default function MinisterioTemplateEquipeIndex() {
  const Pallete = usePallete();
  const [searchText, setSearchText] = useState('');
  const [actionsTemplate, setActionsTemplate] = useState<ResponseEscalaTemplateDto | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | EscalaTemplateTipoEnum>('todos');

  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const searchParams = useMemo(() => {
    if (!ministerioId) return undefined;

    const normalizedSearch = searchText.trim();

    const conditions = [
      {
        path: 'ministerio.id',
        operator: Operator.EQUALS,
        value: { type: ValueType.LITERAL, value: ministerioId },
      },
    ];

    if (normalizedSearch) {
      conditions.push({
        path: 'nome',
        operator: Operator.ILIKE,
        value: {
          type: ValueType.LITERAL,
          value: normalizedSearch,
        },
      });
    }

    return {
      where: {
        conditions,
      },
      relations: ['voluntarios', 'funcoes'],
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId, searchText]);

  const {
    data: templatesData,
    remove: removeTemplate,
    isLoading,
    isLoadingMutation,
    refetch,
    isRefetching,
  } = useEscalaTemplatesCrud({
    autoFetch: Boolean(ministerioId),
    initialParams: searchParams,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleSearch = useCallback((value: string) => {
    setSearchText(value.trim());
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      router.push({
        pathname: 'ministerios/templates_equipe/edit',
        params: { ministerioId, templateId: id },
      });
    },
    [ministerioId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      FancyAlert.alert('Confirmação', 'Deseja realmente excluir este template?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeTemplate(id);
          },
        },
      ]);
    },
    [removeTemplate],
  );

  const filteredTemplates = useMemo(() => {
    const list = templatesData ?? [];
    if (tipoFiltro === 'todos') return list;
    return list.filter((item) => EscalaTemplateTipoEnumMap[item.tipo] === tipoFiltro);
  }, [templatesData, tipoFiltro]);

  const stats = useMemo(() => {
    const list = templatesData ?? [];
    const fixos = list.filter(
      (item) => EscalaTemplateTipoEnumMap[item.tipo] === EscalaTemplateTipoEnum.Fixo,
    ).length;
    return { total: list.length, fixos, funcoes: list.length - fixos };
  }, [templatesData]);

  if (isLoading) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          router.push({
            pathname: 'ministerios/templates_equipe/add',
            params: { ministerioId },
          }),
      }}
      showSearchBar
      searchBarProps={{ value: searchText, onSearch: handleSearch }}
      topContent={
        <View style={styles.topContainer}>
          <FancyListStats
            items={[
              { label: 'Total', value: stats.total },
              { label: 'Equipe Fixa', value: stats.fixos, color: Pallete.primary },
              { label: 'Por Funções', value: stats.funcoes, color: Pallete.secondary },
            ]}
          />
          <View style={styles.filtroContainer}>
            <FancySegmentedControl<'todos' | EscalaTemplateTipoEnum>
              size='sm'
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'Equipe Fixa', value: EscalaTemplateTipoEnum.Fixo },
                { label: 'Por Funções', value: EscalaTemplateTipoEnum.Funcoes },
              ]}
              value={tipoFiltro}
              onChange={setTipoFiltro}
            />
          </View>
        </View>
      }
      listProps={{
        onRefresh: refetch,
        refreshing: isRefetching,
        listEmptyProps: {
          label: searchText ? 'Nenhum template encontrado' : 'Nenhum template cadastrado',
          icon: { library: 'MaterialCommunityIcons', name: 'file-document-outline', size: 68 },
        },
        data: filteredTemplates,
        renderItem: ({ item }) => {
          const tipoLabel = EscalaTemplateTipoLabel[item.tipo];
          const isFixo = EscalaTemplateTipoEnumMap[item.tipo] === EscalaTemplateTipoEnum.Fixo;
          const dimensaoEquipe = isFixo ? item.voluntarios?.length : item.funcoes?.length;
          const dimensaoLabel = isFixo ? 'integrantes' : 'funções';
          return (
            <FancyListItemCard
              onPress={() => item.id && handleEdit(item.id)}
              leading={{
                type: 'icon',
                icon: { ...DefaultIconsNames.group, size: 18 },
                color: Pallete.secondary,
                backgroundColor: ColorUtils.withAlpha(Pallete.secondary, 0.12),
              }}
              title={item.nome}
              subtitle={tipoLabel}
              meta={
                <FancyText
                  size='extraSmall'
                  type='medium'
                  color={Pallete.fonts.inactive}
                  style={styles.meta}
                >
                  {`${dimensaoEquipe ?? 0} ${dimensaoLabel}`}
                </FancyText>
              }
              trailing={{ type: 'menu', onPress: () => setActionsTemplate(item) }}
            />
          );
        },
      }}
    >
      <FancyActionSheet
        visible={!!actionsTemplate}
        onClose={() => setActionsTemplate(null)}
        actions={[
          {
            label: 'Editar',
            icon: { ...DefaultIconsNames.edit, size: 18 },
            onPress: () => actionsTemplate?.id && handleEdit(actionsTemplate.id),
          },
          {
            label: 'Excluir',
            destructive: true,
            disabled: isLoadingMutation,
            icon: { ...DefaultIconsNames.delete, size: 18 },
            onPress: () => actionsTemplate?.id && handleDelete(actionsTemplate.id),
          },
        ]}
      />
    </FancyListPage>
  );
}

const styles = StyleSheet.create({
  topContainer: { gap: 12 },
  filtroContainer: {
    paddingHorizontal: 15,
  },
  meta: {
    lineHeight: 15,
    includeFontPadding: false,
  },
});
