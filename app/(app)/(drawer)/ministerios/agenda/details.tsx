import { useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet } from 'react-native';
import AgendaDetailsDadosTab from '../../../../../components/pages/ministerios/agenda/AgendaDetailsDadosTab';
import AgendaDetailsEscalaTab from '../../../../../components/pages/ministerios/agenda/AgendaDetailsEscalaTab';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import FancyLoading from '../../../../../components/FancyLoading';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useMemo } from 'react';

export default function MinisterioAgendaDetailsPage() {
  const params = useLocalSearchParams<{ id: string; dataOcorrencia: string; ministerioId: string }>();

  const { data, isLoading } = useEventosCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: params.id,
            },
          },
        ],
      },
    },
  });

  const tab_items: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info, size: 14 },
        content: (
          <AgendaDetailsDadosTab
            ministerioId={params.ministerioId}
            dataOcorrencia={new Date(params.dataOcorrencia)}
            evento={data[0]}
          />
        ),
      },
      {
        title: 'Escala',
        icon: { ...DefaultIconsNames['calendar-month'], size: 14 },
        content: <AgendaDetailsEscalaTab />,
      },
    ],
    [params, data]
  );

  if (isLoading) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={tab_items} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 10 },
});
