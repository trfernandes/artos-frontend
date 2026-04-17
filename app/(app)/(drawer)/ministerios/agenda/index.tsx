import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { lastDayOfMonth, startOfMonth } from 'date-fns';
import FancyLoading from '../../../../../components/FancyLoading';
import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
import FancySeparator from '../../../../../components/FancySeparator';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ResponseEventoOcorrenciaDto } from '../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { useAuth } from '../../../../../contexts/AuthContext';
import AgendaEventoCard from '../../../../../components/pages/ministerios/agenda/AgendaEventoCard';
import { isLouvorMinisterioTipo } from '../../../../../utils/evento-ensaio';

export default function MinisterioAgendaIndexPage() {
  const params = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva } = useAuth();
  const isLouvorMinisterio = useMemo(
    () =>
      igrejaAtiva?.ministerios?.some(
        (ministerio) => ministerio.id === params.ministerioId && isLouvorMinisterioTipo(ministerio.tipo),
      ) ?? false,
    [igrejaAtiva?.ministerios, params.ministerioId],
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrenMonth] = useState(new Date());
  const [eventos, setEventos] = useState<ResponseEventoOcorrenciaDto[]>();
  const [isOpeningEvento, setIsOpeningEvento] = useState(false);

  const { buscarPorIntervalo, isLoading } = useEventosCrud({ autoFetch: false });

  const carregarEventosMes = useCallback(async () => {
    if (!igrejaAtiva?.id) return;
    const data = await buscarPorIntervalo({
      dataInicio: startOfMonth(currentMonth),
      dataTermino: lastDayOfMonth(currentMonth),
    });
    setEventos(data);
  }, [buscarPorIntervalo, currentMonth, igrejaAtiva?.id]);

  useEffect(() => {
    void carregarEventosMes();
  }, [carregarEventosMes]);

  useFocusEffect(
    useCallback(() => {
      setIsOpeningEvento(false);
      void carregarEventosMes();
    }, [carregarEventosMes]),
  );

  const daysEvents = useMemo(() => {
    return eventos?.filter((e) => DateUtils.equal(DateUtilsApi.dateOnlyFromApi(e.dataOcorrencia), currentDate));
  }, [currentDate, currentMonth, eventos]);

  if (isLoading) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyCalendar
        containerStyle={styles.calendarContainer}
        visualStyle='agendaPremium'
        onChangeMonthVisualization={(date) => {
          setCurrenMonth(date);
          setCurrentDate(startOfMonth(date));
        }}
        onChangeSelectedDate={setCurrentDate}
        markedDatesType='bottomPoint'
        markedDates={eventos?.map((e) => ({
          date: DateUtilsApi.dateOnlyFromApi(e.dataOcorrencia),
          color: e.cor,
        }))}
        value={currentDate}
      />
      <FancySeparator style={styles.calendarSeparator} />
      <FancyList
        data={daysEvents}
        recycleItems={false}
        maintainVisibleContentPosition={undefined}
        listEmptyProps={{ label: 'Nenhum evento neste dia...', icon: { library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 55 } }}
        keyExtractor={(item) => `${item.eventoId || item.id}-${item.dataOcorrencia}`}
        renderItem={({ item }) => {
          const eventoId = item.eventoId || item.id;
          return (
            <AgendaEventoCard
              data={item}
              showEnsaio={isLouvorMinisterio || !!item.horarioEnsaio || !!item.evento?.horarioEnsaioPadrao}
              onPress={() => {
                setIsOpeningEvento(true);
                requestAnimationFrame(() => {
                  router.push({
                    pathname: '/ministerios/agenda/details',
                    params: {
                      eventoId,
                      dataOcorrencia: item.dataOcorrencia,
                      ministerioId: params.ministerioId,
                    },
                  });
                });
              }}
            />
          );
        }}
        containerStyle={styles.listContainer}
      />
      {isOpeningEvento ? <FancyLoading label='Abrindo evento...' /> : null}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, gap: 8 },
  listContainer: { flex: 10, paddingTop: 2 },
  calendarContainer: { borderWidth: 0, backgroundColor: 'transparent' },
  calendarSeparator: { marginTop: -2, marginBottom: 0, opacity: 0.55 },
});
