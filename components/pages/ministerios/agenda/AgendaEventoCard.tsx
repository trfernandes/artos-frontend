import { View, StyleSheet } from 'react-native';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { useMemo } from 'react';
import { ResponseEventoOcorrenciaDto } from '../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { DateUtilsApi, formatAppDateTime } from '../../../../utils/date_utils';
import { ColorUtils } from '../../../../utils/color_utils';
import { usePallete } from '../../../../hooks/usePallete';
import { resolveEventoEnsaioInfo } from '../../../../utils/evento-ensaio';
import FancyListItemCard from '../../../cards/FancyListItemCard';
import FancyChips from '../../../FancyChips';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';

type AgendaEventoCardProps = {
  data: ResponseEventoOcorrenciaDto;
  showEnsaio?: boolean;
  onPress: () => void;
};

export default function AgendaEventoCard({
  data,
  showEnsaio = false,
  onPress,
}: AgendaEventoCardProps) {
  const palette = usePallete();
  const eventColor = data.cor || palette.primary;
  const isCancelled = data.cancelada === true;

  const ocorrenciaDate = useMemo(
    () => DateUtilsApi.dateOnlyFromApi(data.dataOcorrencia),
    [data.dataOcorrencia],
  );

  const timeRangeText = useMemo(() => {
    if (!data.evento?.dataInicio || !data.evento?.dataTermino) return 'Horário não definido';
    const inicio = formatAppDateTime(data.evento.dataInicio, 'HH:mm');
    const termino = formatAppDateTime(data.evento.dataTermino, 'HH:mm');
    return inicio && termino ? `${inicio} - ${termino}` : 'Horário não definido';
  }, [data.evento?.dataInicio, data.evento?.dataTermino]);

  const countdownLabel = useMemo(() => {
    const diffDays = differenceInCalendarDays(startOfDay(ocorrenciaDate), startOfDay(new Date()));
    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays}d`;
  }, [ocorrenciaDate]);

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

  const local = showEnsaio ? undefined : data.local || data.evento?.local || undefined;

  return (
    <FancyListItemCard
      onPress={onPress}
      containerStyle={isCancelled && { opacity: 0.6 }}
      leading={{
        type: 'date',
        day: String(ocorrenciaDate.getDate()).padStart(2, '0'),
        month: ocorrenciaDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        color: eventColor,
        backgroundColor: ColorUtils.withAlpha(eventColor, 0.12),
      }}
      title={data.nome}
      titleProps={
        isCancelled
          ? { style: { textDecorationLine: 'line-through' }, color: palette.fonts.inactive }
          : undefined
      }
      subtitle={timeRangeText}
      status={
        <FancyChips
          size='small'
          label={isCancelled ? 'Cancelado' : countdownLabel}
          color={isCancelled ? palette.fonts.inactive : eventColor}
          dot={!isCancelled && countdownLabel === 'Hoje'}
        />
      }
      meta={
        local || ensaioInfo.label ? (
          <View style={styles.metaRow}>
            {local ? (
              <FancyText
                size='extraSmall'
                type='medium'
                color={palette.fonts.inactive}
                numberOfLines={1}
                style={styles.metaText}
              >
                {local}
              </FancyText>
            ) : null}
            {local && ensaioInfo.label ? (
              <View style={[styles.metaDot, { backgroundColor: palette.fonts.inactive }]} />
            ) : null}
            {ensaioInfo.label ? (
              <View style={styles.metaItem}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='music-note-eighth'
                  size={11}
                  color={palette.fonts.inactive}
                />
                <FancyText
                  size='extraSmall'
                  type='medium'
                  color={palette.fonts.inactive}
                  numberOfLines={1}
                  style={styles.metaText}
                >
                  {ensaioInfo.label}
                </FancyText>
              </View>
            ) : null}
          </View>
        ) : undefined
      }
      trailing={{ type: 'chevron' }}
    />
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  metaText: {
    flexShrink: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    flexShrink: 0,
  },
});
