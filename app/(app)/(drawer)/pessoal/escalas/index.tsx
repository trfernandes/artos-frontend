import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyCalendar, { MarkedDate } from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { endOfMonth, isBefore, startOfMonth } from 'date-fns';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';

import SubstituicaoModalPage from '../../../../../components/pages/pessoal/escalas/index/SubstituicaoModalPage';
import { EscalaItensRepository } from '../../../../../domain/services/EscalaItensRepository';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import Toast from 'react-native-toast-message';
import EventoDetails, {
    EventoDetailsProps,
} from '../../../../../components/pages/pessoal/escalas/index/EventoDetails';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';
import EventoAccordeon from '../../../../../components/pages/pessoal/escalas/index/EventoAccordeon';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import SubstituicoesRequestsFrame from '../../../../../components/pages/pessoal/escalas/index/SubstituicoesRequestsFrame';
import PendenciasChip from '../../../../../components/pages/pessoal/escalas/index/PendenciasChip';
import FancySeparator from '../../../../../components/FancySeparator';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import { resolveEventoEnsaioInfo } from '../../../../../utils/evento-ensaio';
import { ResponseVoluntarioDto } from '../../../../../domain/dtos/Voluntario/voluntario.response';

export const StatusColorMap: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: '#F59E0B', // Amber 500
  [EscalaItemStatusEnum.Confirmado]: '#16A34A', // Green 600
  [EscalaItemStatusEnum.Ausente]: '#DC2626', // Red 600
  [EscalaItemStatusEnum.Substituido]: '#2563EB', // Blue 600
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: '#7C3AED', // Indigo 600
};

export type EscalaDoDiaAgrupada = {
  eventoId: string;
  evento: ResponseEscalaItemDto['evento'];
  dataOcorrencia: Date;
  ministerio: NonNullable<ResponseEscalaItemDto['voluntario']>['ministerio'];
  voluntario: ResponseEscalaItemDto['voluntario'];
  itens: ResponseEscalaItemDto[];
  horarioEnsaio?: string;
  responsavelSetlistVoluntarioId?: string;
  responsavelSetlistVoluntario?: ResponseVoluntarioDto | null;
};

function firstRouteParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveRouteDate(value?: string | string[]) {
  const raw = firstRouteParam(value);
  if (!raw) return null;

  try {
    const date = DateUtilsApi.dateOnlyFromApi(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export default function MinhasEscalasIndexPage() {
  const { user, igrejaAtiva } = useAuth();
  const params = useLocalSearchParams<{
    selectedDate?: string;
    dataOcorrencia?: string;
    dataEvento?: string;
    month?: string;
    dataReferencia?: string;
    escalaId?: string;
  }>();
  const [escalasDoUsuario, setEscalasDoUsuario] = useState<ResponseEscalaItemDto[]>([]);
  const [isLoadingEscalas, setIsLoadingEscalas] = useState<boolean>(true);
  const { update: updateEscala, isLoadingMutation: isLoading } = useEscalaItensCrud();

  const [substituicaoPageParams, setSubstituicaoPageParams] = useState<
    { visible: boolean; dadosEscala?: ResponseEscalaItemDto } | undefined
  >({
    visible: false,
  });
  const [eventoPageParams, setEventoPageParams] = useState<{
    visible: boolean;
    data?: EventoDetailsProps;
  }>({
    visible: false,
  });

  const substituicoesParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'substituto.voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: user?.user?.id! },
          },
          {
            path: 'status',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: EscalaSubstituicaoStatusEnum.Pendente,
            },
          },
        ],
      },
      relations: [
        'escalaItem',
        'escalaItem.evento',
        'escalaItem.funcao',
        'solicitante',
        'solicitante.voluntario',
        'substituto',
        'substituto.voluntario',
      ],
    }),
    [user?.user?.id],
  );
  const {
    add: addSubstituicao,
    data: solicitacoesDeSubstituicao,
    update: updateSubstituicao,
    isLoadingMutation: isLoadingSubsMut,
  } = useEscalaSubstituicoesCrud({
    autoFetch: true,
    initialParams: substituicoesParams,
  });

  const initialDateFromParams = useMemo(
    () => resolveRouteDate(params.selectedDate ?? params.dataOcorrencia ?? params.dataEvento),
    [params.dataEvento, params.dataOcorrencia, params.selectedDate],
  );
  const initialMonthFromParams = useMemo(
    () => resolveRouteDate(params.month ?? params.dataReferencia),
    [params.dataReferencia, params.month],
  );

  const [selectedDate, setSelectedDate] = useState<Date>(initialDateFromParams ?? initialMonthFromParams ?? new Date());
  const [showingMonth, setShowingMonth] = useState<Date>(initialMonthFromParams ?? initialDateFromParams ?? new Date());
  const [eventosOfSelectedDate, setEventosOfSelectedDate] = useState<EscalaDoDiaAgrupada[]>([]);

  useEffect(() => {
    const nextDate = initialDateFromParams ?? initialMonthFromParams;
    if (!nextDate) return;
    setSelectedDate(nextDate);
    setShowingMonth(nextDate);
  }, [initialDateFromParams, initialMonthFromParams]);

  const loadMonthEscalas = useCallback(async () => {
    if (!igrejaAtiva?.id || !user?.user?.id) return;

    setIsLoadingEscalas(true);
    try {
      const dataInicio = DateUtilsApi.dateOnlyToApi(startOfMonth(showingMonth));
      const dataTermino = DateUtilsApi.dateOnlyToApi(endOfMonth(showingMonth));

      const result = await EscalaItensRepository.getByVoluntarioId(user.user.id, {
        igrejaId: igrejaAtiva.id,
        dataInicio,
        dataTermino,
      });

      // Filtrar escalas geradas — mostrar somente publicadas
      const filtered = result.filter(
        (item) => !item.escala || item.escala.status !== EscalaStatusEnum.Gerada,
      );
      setEscalasDoUsuario(filtered);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Período inválido',
            text2: 'Período inválido para consulta.',
          });
          return;
        }

        if (status === 403) {
          Toast.show({
            type: 'error',
            text1: 'Acesso negado',
            text2: 'Você não pode consultar escalas de outro voluntário.',
          });
          return;
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Não foi possível carregar suas escalas.',
        text2: getApiErrorMessage(error, 'Tente novamente em instantes.'),
      });
    } finally {
      setIsLoadingEscalas(false);
    }
  }, [user?.user?.id, igrejaAtiva?.id, showingMonth]);

  useEffect(() => {
    loadMonthEscalas();
  }, [loadMonthEscalas]);

  useEffect(() => {
    const escalaId = firstRouteParam(params.escalaId);
    if (!escalaId || escalasDoUsuario.length === 0) return;

    const match = escalasDoUsuario.find(
      (item) => item.escala?.id === escalaId || item.id === escalaId,
    );

    if (!match?.dataOcorrencia) return;
    const targetDate = DateUtilsApi.dateOnlyFromApi(match.dataOcorrencia);
    setSelectedDate(targetDate);
    setShowingMonth(targetDate);
  }, [escalasDoUsuario, params.escalaId]);

  const markedDates = useMemo<MarkedDate[]>(() => {
    if (!escalasDoUsuario) return [];

    const keyFrom = (item: ResponseEscalaItemDto) => {
      const ministerioId = item.voluntario?.ministerio?.id ?? '';
      const dataISO = DateUtilsApi.dateOnlyFromApi(item.dataOcorrencia).toISOString();
      const eventoId = item.evento?.id ?? '';
      return `${ministerioId}::${eventoId}::${dataISO}`;
    };

    const eventos = Array.from(
      new Map(
        escalasDoUsuario.map((item) => [
          keyFrom(item),
          {
            ministerioId: item.voluntario?.ministerio?.id!,
            evento: item.evento,
            dataOcorrencia: item.dataOcorrencia,
          },
        ]),
      ).values(),
    ).sort((a, b) => {
      const timeA = DateUtilsApi.dateOnlyFromApi(a.dataOcorrencia).getTime();

      const timeB = DateUtilsApi.dateOnlyFromApi(b.dataOcorrencia).getTime();

      const diffHora = timeA - timeB;
      if (diffHora !== 0) return diffHora;

      return (a.evento?.nome ?? '').localeCompare(b.evento?.nome ?? '', 'pt-BR', {
        sensitivity: 'base',
      });
    });

    return eventos.map((escala) => ({
      date: DateUtilsApi.dateOnlyFromApi(escala.dataOcorrencia),
      color: escala.evento?.cor ?? '#3498db',
    }));
  }, [escalasDoUsuario]);

  const loadDayEscalas = useCallback(
    async (date: Date) => {
      const map = new Map<string, EscalaDoDiaAgrupada>();

      escalasDoUsuario
        // 1) mantém só as escalas desse dia
        .filter((evento) => DateUtilsApi.compareDateOnlyFromApi(evento.dataOcorrencia, date))
        .forEach((item) => {
          const eventoId = item.evento?.id ?? '';
          if (!eventoId) return;

          const dataDate = DateUtilsApi.dateOnlyFromApi(item.dataOcorrencia);

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
              ministerio: item.voluntario?.ministerio ?? item.escala?.ministerio,
              voluntario: item.voluntario,
              itens: [],
              horarioEnsaio: resolveEventoEnsaioInfo({
                horarioEnsaio: item.horarioEnsaio,
                horarioEnsaioPadrao: item.evento?.horarioEnsaioPadrao,
              }).horario,
              responsavelSetlistVoluntarioId: item.responsavelSetlistVoluntarioId,
              responsavelSetlistVoluntario: item.responsavelSetlistVoluntario ?? null,
            };
            map.set(key, agrupado);
          }

          if (!agrupado.horarioEnsaio) {
            agrupado.horarioEnsaio = resolveEventoEnsaioInfo({
              horarioEnsaio: item.horarioEnsaio,
              horarioEnsaioPadrao: item.evento?.horarioEnsaioPadrao,
            }).horario;
          }
          if (!agrupado.ministerio) {
            agrupado.ministerio = item.voluntario?.ministerio ?? item.escala?.ministerio;
          }
          if (!agrupado.responsavelSetlistVoluntarioId) {
            agrupado.responsavelSetlistVoluntarioId = item.responsavelSetlistVoluntarioId;
          }
          if (!agrupado.responsavelSetlistVoluntario && item.responsavelSetlistVoluntario) {
            agrupado.responsavelSetlistVoluntario = item.responsavelSetlistVoluntario;
          }

          // 3) sempre adiciona o registro no grupo
          agrupado.itens.push(item);
        });

      const eventosAgrupados = Array.from(map.values()).sort((a, b) => {
        const diffHora = a.dataOcorrencia.getTime() - b.dataOcorrencia.getTime();
        if (diffHora !== 0) return diffHora;

        return (a.evento?.nome ?? '').localeCompare(b.evento?.nome ?? '', 'pt-BR', {
          sensitivity: 'base',
        });
      });

      setEventosOfSelectedDate(eventosAgrupados);
    },
    [escalasDoUsuario, setEventosOfSelectedDate],
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
            await updateEscala?.({
              id: escalaItensId,
              data: { status: EscalaItemStatusEnum.Ausente },
            });
            await loadMonthEscalas();
          },
        },
        {
          text: 'Sim',
          onPress: async () => {
            await updateEscala?.({
              id: escalaItensId,
              data: { status: EscalaItemStatusEnum.Confirmado },
            });
            await loadMonthEscalas();
          },
        },
      ]);
    },
    [updateEscala, loadMonthEscalas],
  );

  const handleConfirmSubstituicao = useCallback(
    async (escalaItemId: string, solicitanteId: string, substitutoId: string, motivo: string) => {
      await updateEscala?.({
        id: escalaItemId,
        data: { status: EscalaItemStatusEnum.SubstituicaoSolicitada },
      });

      await addSubstituicao({
        escalaItemId: escalaItemId,
        motivo,
        solicitanteId: solicitanteId,
        substitutoId: substitutoId,
      });

      Toast.show({
        type: 'success',
        text1: 'Solicitação de substituição enviada com sucesso.',
      });
      setSubstituicaoPageParams({ visible: false });

      await loadMonthEscalas();
    },
    [updateEscala, loadMonthEscalas, setSubstituicaoPageParams],
  );

  const handleSolicitacaoRespondida = useCallback(
    (substituicao: ResponseEscalaSubstituicaoDto, response: 'accept' | 'reject') => {
      if (response === 'accept') {
        FancyAlert.alert('Aceitar Substituição', 'Você confirma que irá substituir este serviço?', [
          {
            text: 'Não',
            style: 'destructive',
          },
          {
            text: 'Sim',
            onPress: async () => {
              await updateSubstituicao?.({
                id: substituicao.id!,
                data: {
                  status: EscalaSubstituicaoStatusEnum.Aprovada,
                  dataResposta: DateUtilsApi.dateTimeToApi(new Date()),
                },
              });

              Toast.show({
                type: 'success',
                text1: 'Substituição aceita com sucesso.',
              });
            },
          },
        ]);
      } else if (response === 'reject') {
        FancyAlert.alert(
          'Recusar Substituição',
          'Você confirma que irá recusar esta substituição?',
          [
            {
              text: 'Não',
              style: 'destructive',
            },
            {
              text: 'Sim',
              onPress: async () => {
                await updateSubstituicao?.({
                  id: substituicao.id!,
                  data: {
                    status: EscalaSubstituicaoStatusEnum.Recusada,
                    dataResposta: DateUtilsApi.dateTimeToApi(new Date()),
                  },
                });
                Toast.show({
                  type: 'success',
                  text1: 'Substituição recusada com sucesso.',
                });
              },
            },
          ],
        );
      }
    },
    [updateSubstituicao],
  );

  if (isLoading || isLoadingEscalas || isLoadingSubsMut) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <PendenciasChip count={solicitacoesDeSubstituicao?.length ?? 0} />

      {solicitacoesDeSubstituicao && solicitacoesDeSubstituicao.length > 0 && (
        <SubstituicoesRequestsFrame
          data={solicitacoesDeSubstituicao}
          onRespond={handleSolicitacaoRespondida}
        />
      )}

      <FancyCalendar
        containerStyle={styles.calendarContainer}
        visualStyle='agendaPremium'
        value={selectedDate}
        markedDates={markedDates}
        onChangeSelectedDate={setSelectedDate}
        onChangeMonthVisualization={(data) => {
          setShowingMonth(data);
          if (isBefore(data, new Date())) {
            setSelectedDate(new Date());
          } else {
            setSelectedDate(data);
          }
        }}
      />
      <FancySeparator style={styles.calendarSeparator} />
      <View style={styles.eventsListContainer}>
        {eventosOfSelectedDate.length === 0 ? (
          <FancyListEmpty
            label='Nenhuma escala neste dia'
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 55 }}
          />
        ) : (
          <FancyList
            bottomSpace={-10}
            containerStyle={{ borderWidth: 0, flex: 1 }}
            data={eventosOfSelectedDate}
            renderItem={({ item, index }) => (
              <EventoAccordeon
                data={item}
                key={index}
                onConfirmButtonPress={(dadosEscala) => handleConfirmEvento(dadosEscala.id!)}
                onSubButtonPress={(dadosEscala) =>
                  setSubstituicaoPageParams({
                    visible: true,
                    dadosEscala,
                  })
                }
              />
            )}
          />
        )}
        {substituicaoPageParams?.visible && (
          <SubstituicaoModalPage
            dadosEscala={substituicaoPageParams.dadosEscala!}
            onButton1Press={() => setSubstituicaoPageParams({ visible: false })}
            onButton2Press={(data) =>
              data &&
              handleConfirmSubstituicao(
                data.escalaItemId,
                data.solicitanteId,
                data.substitutoId,
                data.motivo,
              )
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
  container: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderWidth: 0,
    gap: 8,
  },
  calendarContainer: { backgroundColor: 'transparent', borderWidth: 0 },
  calendarSeparator: { marginTop: -2, marginBottom: 0, opacity: 0.55 },
  eventsListContainer: { flex: 1, paddingTop: 2 },
});
