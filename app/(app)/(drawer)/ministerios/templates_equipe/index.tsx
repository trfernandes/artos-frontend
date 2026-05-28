import { router, useLocalSearchParams } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { usePallete } from '../../../../../hooks/usePallete';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useCallback, useMemo, useState } from 'react';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
    EscalaTemplateTipoLabel,
    EscalaTemplateTipoEnumMap,
    EscalaTemplateTipoEnum,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { ResponseEscalaTemplateDto } from '../../../../../domain/dtos/EscalaTemplate/escala-template.response';

export default function MinisterioTemplateEquipeIndex() {
  const Pallete = usePallete();
  const [searchText, setSearchText] = useState('');
  const [actionsTemplate, setActionsTemplate] = useState<ResponseEscalaTemplateDto | null>(null);

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
      listProps={{
        onRefresh: refetch,
        refreshing: isRefetching,
        listEmptyProps: {
          label: searchText ? 'Nenhum template encontrado' : 'Nenhum template cadastrado',
          icon: { library: 'MaterialCommunityIcons', name: 'file-document-outline', size: 68 },
        },
        data: templatesData,
        renderItem: ({ item }) => {
          const tipoLabel = EscalaTemplateTipoLabel[item.tipo];
          const dimensaoEquipe =
            EscalaTemplateTipoEnumMap[item.tipo] === EscalaTemplateTipoEnum.Fixo ? item.voluntarios?.length : item.funcoes?.length;
          return (
            <FancyCard.Image
              type='icon'
              props={{
                title: item.nome,
                subtitle: <FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'tag-outline', size: 12, color: Pallete.primary }} value={tipoLabel} />,
                additionalData1: <FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 12, color: Pallete.primary }} value={(dimensaoEquipe ?? 0).toString()} />,
                cardIcon: {
                  ...DefaultIconsNames.group,
                  size: 18,
                  style: { marginTop: -2.5 },
                },
                actionButtons: [
                  {
                    icon: {
                      library: 'MaterialCommunityIcons',
                      name: 'dots-vertical',
                      size: 20,
                      backgroundColor: Pallete.secondary,
                    },
                    onPress: () => setActionsTemplate(item),
                  },
                ],
              }}
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
