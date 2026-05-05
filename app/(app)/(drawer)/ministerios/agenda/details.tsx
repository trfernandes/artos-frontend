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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ResponseEventoOcorrenciaDto } from '../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';

export default function MinisterioAgendaDetailsPage() {
  const params = useLocalSearchParams<{ id?: string; eventoId?: string; dataOcorrencia: string; ministerioId: string }>();
  const eventoId = params.eventoId || params.id || '';
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState<ResponseEventoOcorrenciaDto | null>(null);
  const [isLoadingOcorrencia, setIsLoadingOcorrencia] = useState(false);

  const { data, isLoading, buscarPorIntervalo } = useEventosCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: eventoId,
            },
          },
        ],
      },
    },
  });

  const carregarOcorrenciaAtual = useCallback(async () => {
    if (!eventoId || !params.dataOcorrencia) {
      setOcorrenciaAtual(null);
      return;
    }

    setIsLoadingOcorrencia(true);
    try {
      const ocorrencias = await buscarPorIntervalo({
        dataInicio: params.dataOcorrencia,
        dataTermino: params.dataOcorrencia,
      });

      const timestampSelecionado = new Date(params.dataOcorrencia).getTime();
      const selecionada =
        ocorrencias.find((item) => {
          const sameEvento = (item.eventoId || item.id) === eventoId;
          const sameData =
            item.dataOcorrencia === params.dataOcorrencia ||
            new Date(item.dataOcorrencia).getTime() === timestampSelecionado;
          return sameEvento && sameData;
        }) || null;

      setOcorrenciaAtual(selecionada);
    } catch {
      setOcorrenciaAtual(null);
    } finally {
      setIsLoadingOcorrencia(false);
    }
  }, [buscarPorIntervalo, eventoId, params.dataOcorrencia]);

  useEffect(() => {
    void carregarOcorrenciaAtual();
  }, [carregarOcorrenciaAtual]);

  const tab_items: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info, size: 14 },
        content: (
          <AgendaDetailsDadosTab
            ministerioId={params.ministerioId}
            dataOcorrenciaIso={params.dataOcorrencia}
            dataOcorrenciaDate={new Date(params.dataOcorrencia)}
            ocorrencia={ocorrenciaAtual || undefined}
            evento={data[0]}
            onTemplateSaved={carregarOcorrenciaAtual}
          />
        ),
      },
      {
        title: 'Equipe',
        icon: { ...DefaultIconsNames.group, size: 20 },
        content: <AgendaDetailsEscalaTab eventoId={eventoId} dataOcorrencia={new Date(params.dataOcorrencia)} />,
      },
    ],
    [carregarOcorrenciaAtual, data, eventoId, ocorrenciaAtual, params.dataOcorrencia, params.ministerioId],
  );

  if (isLoading || isLoadingOcorrencia || !eventoId || !data[0]) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={tab_items}
        contentContainerStyle={{ flex: 1 }}
        containerStyle={{ flex: 1 }}
        headerStyle={{ paddingHorizontal: 0 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingBottom: 10 },
});
