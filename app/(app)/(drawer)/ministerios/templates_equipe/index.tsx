import { router, useLocalSearchParams } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useCallback, useMemo, useState } from 'react';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { EscalaTemplateTipoEnum, EscalaTemplateTipoEnumMap, EscalaTemplateTipoLabel } from '../../../../../domain/models/EscalaTemplate';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';

export default function MinisterioTemplateEquipeIndex() {
  const [searchText, setSearchText] = useState('');

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
  } = useEscalaTemplatesCrud({
    autoFetch: Boolean(ministerioId),
    initialParams: searchParams,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchText(value.trim());
  }, []);

  const handleEdit = useCallback((id: string) => {
    router.push({
      pathname: 'ministerios/templates_equipe/edit',
      params: { ministerioId, templateId: id },
    });
  }, [ministerioId]);

  const handleDelete = useCallback((id: string) => {
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
  }, [removeTemplate]);

  if (isLoading || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () => router.push({ pathname: 'ministerios/templates_equipe/add', params: { ministerioId } }),
      }}
      showSearchBar
      searchBarProps={{ value: searchText, onSearch: handleSearch }}
      listProps={{
        data: templatesData,
        renderItem: ({ item }) => {
          const tipoLabel = EscalaTemplateTipoLabel[item.tipo];
          const dimensaoEquipe =
            EscalaTemplateTipoEnumMap[item.tipo] === EscalaTemplateTipoEnum.Fixo ? item.voluntarios?.length : item.funcoes?.length;
          return (
            <FancyCard.Image 
              type="icon"
              props={{
                title: item.nome,
                subtitle: `Tipo: ${tipoLabel}`,
                additionalData1: `Dimensão equipe: ${dimensaoEquipe ?? 0}`,
                cardIcon: { ...DefaultIconsNames.group, size: 18, style: { marginTop: -2.5 } },
                actionButtons: [
                  {
                    icon: { ...DefaultIconsNames.edit, size: 18 },
                    onPress: () => item.id && handleEdit(item.id),
                  },
                  {
                    icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                    onPress: () => item.id && handleDelete(item.id),
                  },
                ],
              }}
            />
          );
        },
      }}
    />
  );
}
