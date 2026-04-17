import { Pressable, StyleSheet } from 'react-native';
import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { useMemo } from 'react';
import { ResponseEventoOcorrenciaDto } from '../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { ColorUtils } from '../../../../utils/color_utils';
import { Pallete } from '../../../../constants/colors';
import EventoCardContent from '../../../cards/EventoCardContent';
import { resolveEventoEnsaioInfo } from '../../../../utils/evento-ensaio';

type AgendaEventoCardProps = {
  data: ResponseEventoOcorrenciaDto;
  showEnsaio?: boolean;
  onPress: () => void;
};

export default function AgendaEventoCard({ data, showEnsaio = false, onPress }: AgendaEventoCardProps) {
  const eventColor = data.cor || Pallete.primary;

  const timeRangeText = useMemo(() => {
    if (!data.evento?.dataInicio || !data.evento?.dataTermino) return 'Horario nao definido';
    return `${format(DateUtilsApi.dateTimeFromApi(data.evento.dataInicio), 'HH:mm')} - ${format(
      DateUtilsApi.dateTimeFromApi(data.evento.dataTermino),
      'HH:mm',
    )}`;
  }, [data.evento?.dataInicio, data.evento?.dataTermino]);

  const countdownLabel = useMemo(() => {
    const diffDays = differenceInCalendarDays(
      startOfDay(DateUtilsApi.dateOnlyFromApi(data.dataOcorrencia)),
      startOfDay(new Date()),
    );
    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays}d`;
  }, [data.dataOcorrencia]);

  const ensaioInfo = useMemo(
    () =>
      resolveEventoEnsaioInfo({
        horarioEnsaio: data.horarioEnsaio,
        horarioEnsaioPadrao: data.evento?.horarioEnsaioPadrao,
        isLouvor: showEnsaio,
        fallbackLabel: 'Horário de ensaio a definir',
      }),
    [data.horarioEnsaio, data.evento?.horarioEnsaioPadrao, showEnsaio],
  );

  const cardBg = useMemo(() => ColorUtils.lightenColor(eventColor, 0.918), [eventColor]);
  const borderColor = useMemo(() => ColorUtils.withAlpha(eventColor, 0.16), [eventColor]);

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <EventoCardContent
        timeRangeText={timeRangeText}
        countdownLabel={countdownLabel}
        title={data.nome}
        eventColor={eventColor}
        metaPrimary={showEnsaio ? undefined : data.local || data.evento?.local || undefined}
        metaSecondary={ensaioInfo.label}
        isAccordion={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    ...Pallete.shadows[100],
  },
});
