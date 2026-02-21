import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { formatDate, lastDayOfMonth, startOfMonth } from 'date-fns';
import FancyLoading from '../../../../../components/FancyLoading';
import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancySeparator from '../../../../../components/FancySeparator';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ResponseEventoOcorrenciaDto } from '../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';

export default function MinisterioAgendaIndexPage() {
  const palette = usePallete();
  const params = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrenMonth] = useState(new Date());
  const [eventos, setEventos] = useState<ResponseEventoOcorrenciaDto[]>();

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
        listEmptyProps={{ label: 'Nenhum evento neste dia...', icon: { library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 55 } }}
        keyExtractor={(item) => `${item.eventoId || item.id}-${item.dataOcorrencia}`}
        renderItem={({ item }) => {
          const eventoId = item.eventoId || item.id;
          const subtitle =
            item.evento?.dataTermino && `${formatDate(item.evento.dataInicio, 'HH:mm')} à ${formatDate(item.evento.dataTermino, 'HH:mm')}`;
          return (
            <FancyCard.Color
              title={item.nome}
              subtitle={subtitle}
              color={item.cor || palette.primary}
              actionButtons={[
                {
                  icon: {
                    ...DefaultIconsNames['chevron-right'],
                    size: 20,
                  },
                  onPress: () => {
                    router.push({
                      pathname: '/ministerios/agenda/details',
                      params: {
                        eventoId,
                        dataOcorrencia: item.dataOcorrencia,
                        ministerioId: params.ministerioId,
                      },
                    });
                  },
                },
              ]}
            />
          );
        }}
        containerStyle={styles.listContainer}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, gap: 10 },
  listContainer: { flex: 10 },
  calendarContainer: { borderWidth: 0, backgroundColor: 'transparent' },
  calendarSeparator: { marginTop: 0, marginBottom: 0 },
});
