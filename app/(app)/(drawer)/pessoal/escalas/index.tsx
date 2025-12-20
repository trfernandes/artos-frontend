import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyCalendar, { MarkedDate } from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { endOfMonth, getMinutes, isBefore, isSameDay, startOfMonth } from 'date-fns';
import { EscalaItem, EscalaItemStatusEnum } from '../../../../../domain/models/EscalaItem';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';
import SubstituicaoModalPage from '../../../../../components/pages/pessoal/escalas/index/SubstituicaoModalPage';
import { EscalaItensRepository } from '../../../../../domain/services/EscalaItensRepository';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import Toast from 'react-native-toast-message';
import EventoDetails, { EventoDetailsProps } from '../../../../../components/pages/pessoal/escalas/index/EventoDetails';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import EventoAccordeon from '../../../../../components/pages/pessoal/escalas/index/EventoAccordeon';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import { EscalaSubstituicao, EscalaSubstituicaoStatusEnum } from '../../../../../domain/models/EscalaSubstituicao';
import SubstituicoesRequestsFrame from '../../../../../components/pages/pessoal/escalas/index/SubstituicoesRequestsFrame';
import FancySeparator from '../../../../../components/FancySeparator';

export const StatusColorMap: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: '#F59E0B', // Amber 500
  [EscalaItemStatusEnum.Confirmado]: '#16A34A', // Green 600
  [EscalaItemStatusEnum.Ausente]: '#DC2626', // Red 600
  [EscalaItemStatusEnum.Substituido]: '#2563EB', // Blue 600
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: '#7C3AED', // Indigo 600
};

export type EscalaDoDiaAgrupada = {
  eventoId: string;
  evento: EscalaItem['evento'];
  dataOcorrencia: Date;
  ministerio: EscalaItem['voluntario']['ministerio'];
  voluntario: EscalaItem['voluntario'];
  itens: EscalaItem[];
};

export default function MinhasEscalasIndexPage() {
  const { user } = useAuth();
  const [escalasDoUsuario, setEscalasDoUsuario] = useState<EscalaItem[]>([]);
  const [isLoadingEscalas, setIsLoadingEscalas] = useState<boolean>(true);
  const { update: updateEscala, isLoadingMutation: isLoading } = useEscalaItensCrud();

  const [substituicaoPageParams, setSubstituicaoPageParams] = useState<
    { visible: boolean; dadosEscala?: EscalaItem } | undefined
  >({
    visible: false,
  });
  const [eventoPageParams, setEventoPageParams] = useState<{
    visible: boolean;
    data?: EventoDetailsProps;
  }>({
    visible: false,
  });

  const substituicoesParams: DynamicQuery = {
    where: {
      conditions: [
        {
          path: 'substituto.voluntario.id',
          operator: Operator.EQUALS,
          value: { type: ValueType.LITERAL, value: user?.id! },
        },
        {
          path: 'status',
          operator: Operator.EQUALS,
          value: { type: ValueType.LITERAL, value: EscalaSubstituicaoStatusEnum.Pendente },
        },
      ],
    },
    relations: [
      'escalaItens',
      'escalaItens.evento',
      'escalaItens.funcao',
      'solicitante',
      'solicitante.voluntario',
      'substituto',
      'substituto.voluntario',
    ],
  };
  const {
    add: addSubstituicao,
    data: solicitacoesDeSubstituicao,
    update: updateSubstituicao,
    isLoadingMutation: isLoadingSubsMut,
  } = useEscalaSubstituicoesCrud({
    autoFetch: true,
    initialParams: substituicoesParams,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showingMonth, setShowingMonth] = useState<Date>(new Date());
  const [eventosOfSelectedDate, setEventosOfSelectedDate] = useState<EscalaDoDiaAgrupada[]>([]);

  const loadMonthEscalas = useCallback(async () => {
    setIsLoadingEscalas(true);
    try {
      const result = await EscalaItensRepository.search({
        where: {
          conditions: [
            {
              path: 'voluntario.voluntario.id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: user?.id! },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.GTE,
              value: { type: ValueType.LITERAL, value: startOfMonth(showingMonth).toISOString() },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.LTE,
              value: { type: ValueType.LITERAL, value: endOfMonth(showingMonth).toISOString() },
            },
          ],
        },
        relations: ['voluntario', 'evento', 'escala', 'funcao', 'voluntario.ministerio'],
      });
      setEscalasDoUsuario(result);
    } finally {
      setIsLoadingEscalas(false);
    }
  }, [user?.id, showingMonth]);

  useEffect(() => {
    loadMonthEscalas();
  }, [loadMonthEscalas]);

  const markedDates = useMemo<MarkedDate[]>(() => {
    if (!escalasDoUsuario) return [];

    const keyFrom = (item: EscalaItem) => {
      const ministerioId = item.voluntario.ministerioId ?? item.voluntario.ministerio?.id ?? '';
      const dataISO =
        item.dataOcorrencia instanceof Date ? item.dataOcorrencia.toISOString() : new Date(item.dataOcorrencia).toISOString();
      const eventoId = item.evento?.id ?? '';
      return `${ministerioId}::${eventoId}::${dataISO}`;
    };

    const eventos = Array.from(
      new Map(
        escalasDoUsuario.map(item => [
          keyFrom(item),
          {
            ministerioId: item.voluntario.ministerioId ?? item.voluntario.ministerio?.id!,
            evento: item.evento,
            dataOcorrencia: item.dataOcorrencia,
          },
        ])
      ).values()
    ).sort((a, b) => {
      const timeA = a.dataOcorrencia instanceof Date ? a.dataOcorrencia.getTime() : new Date(a.dataOcorrencia).getTime();

      const timeB = b.dataOcorrencia instanceof Date ? b.dataOcorrencia.getTime() : new Date(b.dataOcorrencia).getTime();

      const diffHora = timeA - timeB;
      if (diffHora !== 0) return diffHora;

      return (a.evento?.nome ?? '').localeCompare(b.evento?.nome ?? '', 'pt-BR', { sensitivity: 'base' });
    });

    return eventos.map(escala => ({
      date: escala.dataOcorrencia instanceof Date ? escala.dataOcorrencia : new Date(escala.dataOcorrencia),
      color: escala.evento?.cor ?? '#3498db',
    }));
  }, [escalasDoUsuario]);

  const loadDayEscalas = useCallback(
    async (date: Date) => {
      const map = new Map<string, EscalaDoDiaAgrupada>();

      escalasDoUsuario
        // 1) mantém só as escalas desse dia
        .filter(evento => isSameDay(new Date(evento.dataOcorrencia), date))
        .forEach(item => {
          const eventoId = item.evento?.id ?? '';
          if (!eventoId) return;

          const dataDate = item.dataOcorrencia instanceof Date ? item.dataOcorrencia : new Date(item.dataOcorrencia);

          // se quiser separar também por horário, manter o ISO inteiro faz sentido
          const dataISO = dataDate.toISOString();

          // 2) chave = EVENTO + DATA_OCORRENCIA
          const key = `${eventoId}::${dataISO}`;

          let agrupado = map.get(key);
          if (!agrupado) {
            agrupado = {
              eventoId,
              evento: item.evento,
              dataOcorrencia: dataDate,
              ministerio: item.voluntario.ministerio,
              voluntario: item.voluntario,
              itens: [],
            };
            map.set(key, agrupado);
          }

          // 3) sempre adiciona o registro no grupo
          agrupado.itens.push(item);
        });

      const eventosAgrupados = Array.from(map.values()).sort((a, b) => {
        const diffHora = getMinutes(a.dataOcorrencia) - getMinutes(b.dataOcorrencia);
        if (diffHora !== 0) return diffHora;

        return (a.evento?.nome ?? '').localeCompare(b.evento?.nome ?? '', 'pt-BR', {
          sensitivity: 'base',
        });
      });

      setEventosOfSelectedDate(eventosAgrupados);
    },
    [escalasDoUsuario, setEventosOfSelectedDate]
  );

  useEffect(() => {
    loadDayEscalas(selectedDate);
  }, [loadDayEscalas, selectedDate]);

  const handleConfirmEvento = useCallback(
    (escalaItensId: string) => {
      FancyAlert.alert('Confirmação', 'Você confirma seu serviço neste evento?', [
        {
          text: 'Não',
          style: 'destructive',
          onPress: async () => {
            await updateEscala({ id: escalaItensId, data: { status: EscalaItemStatusEnum.Ausente } });
            await loadMonthEscalas();
          },
        },
        {
          text: 'Sim',
          onPress: async () => {
            await updateEscala({ id: escalaItensId, data: { status: EscalaItemStatusEnum.Confirmado } });
            await loadMonthEscalas();
          },
        },
      ]);
    },
    [updateEscala, loadMonthEscalas]
  );

  const handleConfirmSubstituicao = useCallback(
    async (escalaItemId: string, solicitanteId: string, substitutoId: string, motivo: string) => {
      await updateEscala({ id: escalaItemId, data: { status: EscalaItemStatusEnum.SubstituicaoSolicitada } });

      await addSubstituicao({
        escalaItemId,
        dataSolicitacao: new Date(),
        motivo,
        solicitanteId,
        substitutoId,
        status: EscalaSubstituicaoStatusEnum.Pendente,
      });

      Toast.show({ type: 'success', text1: 'Solicitação de substituição enviada com sucesso.' });
      setSubstituicaoPageParams({ visible: false });

      await loadMonthEscalas();
    },
    [updateEscala, loadMonthEscalas, setSubstituicaoPageParams]
  );

  const handleSolicitacaoRespondida = useCallback(
    (substituicao: EscalaSubstituicao, response: 'accept' | 'reject') => {
      if (response === 'accept') {
        FancyAlert.alert('Aceitar Substituição', 'Você confirma que irá substituir este serviço?', [
          {
            text: 'Não',
            style: 'destructive',
          },
          {
            text: 'Sim',
            onPress: async () => {
              await updateSubstituicao({
                id: substituicao.id!,
                data: { status: EscalaSubstituicaoStatusEnum.Aprovada, dataResposta: new Date() },
              });

              Toast.show({ type: 'success', text1: 'Substituição aceita com sucesso.' });
            },
          },
        ]);
      } else if (response === 'reject') {
        FancyAlert.alert('Recusar Substituição', 'Você confirma que irá recusar esta substituição?', [
          {
            text: 'Não',
            style: 'destructive',
          },
          {
            text: 'Sim',
            onPress: async () => {
              await updateSubstituicao({
                id: substituicao.id!,
                data: { status: EscalaSubstituicaoStatusEnum.Recusada, dataResposta: new Date() },
              });
              Toast.show({ type: 'success', text1: 'Substituição recusada com sucesso.' });
            },
          },
        ]);
      }
    },
    [updateSubstituicao]
  );

  if (isLoading || isLoadingEscalas || isLoadingSubsMut) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      {solicitacoesDeSubstituicao && solicitacoesDeSubstituicao.length > 0 && (
        <SubstituicoesRequestsFrame data={solicitacoesDeSubstituicao} onRespond={handleSolicitacaoRespondida} />
      )}

      <FancyCalendar
        value={selectedDate}
        markedDates={markedDates}
        onChangeSelectedDate={setSelectedDate}
        onChangeMonthVisualization={data => {
          setShowingMonth(data);
          if (isBefore(data, new Date())) {
            setSelectedDate(new Date());
          } else {
            setSelectedDate(data);
          }
        }}
      />
      <FancySeparator />
      <View style={styles.eventsListContainer}>
        <FancyList
          bottomSpace={-10}
          ListEmptyComponent={() => <FancyListEmpty />}
          containerStyle={{ borderWidth: 0, flex: 1 }}
          data={eventosOfSelectedDate}
          renderItem={({ item, index }) => (
            <EventoAccordeon
              data={item}
              key={index}
              onConfirmButtonPress={dadosEscala => handleConfirmEvento(dadosEscala.id!)}
              onSubButtonPress={dadosEscala => setSubstituicaoPageParams({ visible: true, dadosEscala })}
            />
          )}
        />
        {substituicaoPageParams?.visible && (
          <SubstituicaoModalPage
            dadosEscala={substituicaoPageParams.dadosEscala!}
            onButton1Press={() => setSubstituicaoPageParams({ visible: false })}
            onButton2Press={data =>
              data && handleConfirmSubstituicao(data.escalaItemId, data.solicitanteId, data.substitutoId, data.motivo)
            }
          />
        )}
        {eventoPageParams.visible && (
          <EventoDetails
            eventoId={eventoPageParams.data!.eventoId}
            data={eventoPageParams.data!.data}
            onButton1Press={() => setEventoPageParams({ visible: false })}
            onButton2Press={() => setEventoPageParams({ visible: false })}
          />
        )}
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 25, paddingTop: 5, paddingBottom: 15, borderWidth: 0, gap: 20 },
  eventsListContainer: { flex: 1, paddingTop: 5 },
});
