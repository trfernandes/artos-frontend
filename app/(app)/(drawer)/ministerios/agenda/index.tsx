import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import FancyList from '../../../../../components/list/FancyList';
import { useEffect, useMemo, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { Evento } from '../../../../../domain/models/Evento';
import { formatDate, lastDayOfMonth, startOfMonth } from 'date-fns';
import FancyLoading from '../../../../../components/FancyLoading';
import DateUtils from '../../../../../utils/date_utils';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { strfyObj } from '../../../../../utils/text_utils';
import FancySeparator from '../../../../../components/FancySeparator';
import { router, useLocalSearchParams } from 'expo-router';

export default function MinisterioAgendaIndexPage() {
  const params = useLocalSearchParams<{ ministerioId: string }>();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrenMonth] = useState(new Date());
  const [eventos, setEventos] = useState<Evento[]>();

  const { buscarPorIntervalo, isLoading } = useEventosCrud({ autoFetch: false });

  useEffect(() => {
    console.log('useEffect');
    buscarPorIntervalo({
      dataInicio: startOfMonth(currentMonth),
      dataTermino: lastDayOfMonth(currentMonth),
    }).then(data => {
      console.log('Eventos:', strfyObj(data));
      setEventos(
        data.map(e => ({
          ...e,
          dataInicio: new Date(e.dataInicio),
          dataTermino: new Date(e.dataTermino),
        }))
      );
    });
  }, [currentMonth]);

  const daysEvents = useMemo(() => {
    return eventos?.filter(e => DateUtils.equal(e.dataInicio, currentDate));
  }, [currentDate]);

  if (isLoading) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyCalendar
        containerStyle={styles.calendarContainer}
        onChangeMonthVisualization={date => {
          setCurrenMonth(date);
          setCurrentDate(startOfMonth(date));
        }}
        onChangeSelectedDate={setCurrentDate}
        markedDatesType="bottomPoint"
        markedDates={eventos?.map(e => ({ date: e.dataInicio, color: e.cor }))}
        value={currentDate}
      />
      <FancySeparator />
      <FancyList
        data={daysEvents}
        listEmptyProps={{ label: 'Nenhum evento por aqui...' }}
        renderItem={({ item, index }) => {
          const subtitle = `${formatDate(item.dataInicio, 'HH:mm')} à ${formatDate(
            item.dataTermino,
            'HH:mm'
          )}`;
          return (
            <FancyCard.Color
              key={index}
              title={item.nome}
              subtitle={subtitle}
              color={item.cor || Pallete.primary}
              actionButtons={[
                {
                  icon: { ...DefaultIconsNames['chevron-right'], size: 20 },
                  onPress: () => {
                    router.push({
                      pathname: '/ministerios/agenda/details',
                      params: {
                        id: item.id,
                        dataOcorrencia: item.dataInicio.toDateString(),
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
  container: { paddingTop: 10, paddingHorizontal: 20, gap: 15 },
  listContainer: { flex: 10 },
  calendarContainer: { borderWidth: 0, flex: 1 },
});
