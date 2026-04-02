import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { lastDayOfMonth, startOfMonth } from 'date-fns';
import FancyLoading from '../../../../../components/FancyLoading';
import DateUtils, { APP_TZ, DateUtilsApi } from '../../../../../utils/date_utils';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancySeparator from '../../../../../components/FancySeparator';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ResponseEventoOcorrenciaDto } from '../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';
import { formatInTimeZone } from 'date-fns-tz';
import FancyText from '../../../../../components/FancyText';

export default function MinisterioAgendaIndexPage() {
  const palette = usePallete();
  const params = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrenMonth] = useState(new Date());
  const [eventos, setEventos] = useState<ResponseEventoOcorrenciaDto[]>();
  const [isOpeningEvento, setIsOpeningEvento] = useState(false);

  const { buscarPorIntervalo, isLoading } = useEventosCrud({ autoFetch: false });

  const formatEventTime = useCallback(
    (value?: string) =>
      value ? formatInTimeZone(DateUtilsApi.dateTimeFromApi(value), APP_TZ, 'HH:mm') : undefined,
    [],
  );

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
            item.evento?.dataInicio &&
            item.evento?.dataTermino &&
            `${formatEventTime(item.evento.dataInicio)} à ${formatEventTime(item.evento.dataTermino)}`;
          return (
            <FancyCard.Color
              title={
                <View style={styles.eventCardTitleBlock}>
                  <FancyText size='medium' type='bold' numberOfLines={2} style={styles.eventCardTitle}>
                    {item.nome}
                  </FancyText>
                  {subtitle ? (
                    <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                      {subtitle}
                    </FancyText>
                  ) : null}
                </View>
              }
              color={item.cor || palette.primary}
              actionButtons={[
                {
                  icon: {
                    ...DefaultIconsNames['chevron-right'],
                    size: 20,
                  },
                  onPress: () => {
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
                  },
                },
              ]}
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
  container: { paddingHorizontal: 15, gap: 10 },
  listContainer: { flex: 10 },
  calendarContainer: { borderWidth: 0, backgroundColor: 'transparent' },
  calendarSeparator: { marginTop: 0, marginBottom: 0 },
  eventCardTitleBlock: {
    gap: 2,
  },
  eventCardTitle: {
    opacity: 0.78,
    marginVertical: 0,
  },
});
