import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import EscalaInsightsView from '../../../../../components/pages/ministerios/escalas/details/EscalaInsightsView';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';

export default function MinisterioEscalasInsightsPage() {
  const { ministerioId, escalaId } = useLocalSearchParams<{
    ministerioId: string;
    escalaId: string;
  }>();

  const initialParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: escalaId },
          },
        ],
      },
      relations: [
        'itens',
        'itens.evento',
        'itens.voluntario',
        'itens.voluntario.voluntario',
        'itens.funcao',
      ],
    }),
    [escalaId],
  );

  const { data, isLoading, isError } = useEscalasCrud({
    autoFetch: true,
    initialParams,
  });

  if (isLoading) {
    return <FancyLoading />;
  }

  if (isError || !data?.[0]) {
    return (
      <FancyScreenErrorHandler
        error={{ name: 'Erro', message: 'Erro ao carregar os insights da escala.' }}
      />
    );
  }

  return (
    <FancyPageView style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 }}>
      <EscalaInsightsView escala={data[0]} ministerioId={ministerioId} />
    </FancyPageView>
  );
}
