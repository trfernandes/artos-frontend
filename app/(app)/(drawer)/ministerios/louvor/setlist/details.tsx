import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FancyPageView from '../../../../../../components/containers/FancyPageView';
import EventoSetlistTab from '../../../../../../components/pages/common/EventoSetlistTab';
import FancyLoading from '../../../../../../components/FancyLoading';
import { useEventosCrud } from '../../../../../../hooks/useEventosCrud';
import { Operator, ValueType } from '../../../../../../domain/utils/query_utils';
import { ResponseEventoOcorrenciaDto } from '../../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { canManageEventoOcorrencia } from '../../../../../../utils/ministerio_permissoes';

export default function MinisterioLouvorSetlistDetailsPage() {
  const params = useLocalSearchParams<{
    eventoId: string;
    dataOcorrencia: string;
    ministerioId: string;
  }>();
  const { igrejaAtiva } = useAuth();
  const eventoId = params.eventoId || '';
  const canManage = canManageEventoOcorrencia(igrejaAtiva, params.ministerioId);

  const { data, isLoading, buscarPorIntervalo } = useEventosCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: eventoId },
          },
        ],
      },
    },
  });

  const [ocorrenciaAtual, setOcorrenciaAtual] = useState<ResponseEventoOcorrenciaDto | null>(null);
  const [isLoadingOcorrencia, setIsLoadingOcorrencia] = useState(false);

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

  const mode = useMemo(() => (canManage ? 'lider' : 'leitura'), [canManage]);

  const isLoadingData = isLoading || isLoadingOcorrencia || !eventoId || !data[0];

  if (isLoadingData) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <EventoSetlistTab
        eventoId={eventoId}
        dataOcorrencia={new Date(params.dataOcorrencia)}
        ministerioId={params.ministerioId}
        mode={mode}
        responsavelSetlistNome={ocorrenciaAtual?.responsavelSetlistVoluntario?.nome ?? null}
        detailsRoutePath='/ministerios/agenda/setlist/[itemId]'
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingBottom: 10 },
});
