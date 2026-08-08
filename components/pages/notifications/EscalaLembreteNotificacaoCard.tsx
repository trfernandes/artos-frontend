import { Pressable, StyleSheet, View } from 'react-native';
import FancyCardIcon from '../../cards/Horizontal/FancyCardIcon';
import FancyText from '../../FancyText';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { usePallete } from '../../../hooks/usePallete';
import DefaultIcons from '../../FancyIcons';
import { ColorUtils } from '../../../utils/color_utils';
import { getNotificationToneColor, NOTIFICACAO_THEMES, timeAgoLong } from './NotificacaoCard';
import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';
import { resolveEventoEnsaioInfo } from '../../../utils/evento-ensaio';
import { formatAppDateTime, formatClockTime } from '../../../utils/date_utils';

const ENSAIO_FALLBACK_LABEL = 'Horário de ensaio não definido';

function formatHorarioLabel(value?: string | null) {
  return formatClockTime(value, true) ?? null;
}

export default function EscalaLembreteNotificacaoCard({
  data,
  onPress,
}: {
  data: ResponseNotificacaoDto;
  onPress?: (notification: ResponseNotificacaoDto) => void;
}) {
  const Pallete = usePallete();
  const theme = NOTIFICACAO_THEMES[NotificacaoTipoEnum.EscalaLembrete];
  const accentColor = getNotificationToneColor(theme.tone);

  const createdAt = data.criadaEm || data.createdAt;
  const createdDate = createdAt ? new Date(createdAt) : null;
  const timeAgoA11y = createdDate ? timeAgoLong(createdDate) : '';

  const payload = data.data ?? {};
  const eventDateTimeSource =
    typeof payload.dataEvento === 'string' && payload.dataEvento.length > 0
      ? payload.dataEvento
      : typeof payload.dataOcorrencia === 'string' && payload.dataOcorrencia.length > 0
        ? payload.dataOcorrencia
        : null;
  const hasOccurrence = !!eventDateTimeSource;

  const occurrenceTimeInSP = eventDateTimeSource
    ? formatAppDateTime(eventDateTimeSource, 'HH:mm')
    : null;
  const isMidnight = occurrenceTimeInSP === '00:00';

  const occurrenceDateLabel = eventDateTimeSource
    ? formatAppDateTime(eventDateTimeSource, 'dd/MM')
    : null;
  const occurrenceMinutes =
    eventDateTimeSource && !isMidnight ? formatAppDateTime(eventDateTimeSource, 'mm') : null;
  const occurrenceTimeLabel =
    hasOccurrence && !isMidnight
      ? formatAppDateTime(eventDateTimeSource, occurrenceMinutes === '00' ? "HH'h'" : "HH'h'mm")
      : null;
  const eventDateTimeLabel = [occurrenceDateLabel, occurrenceTimeLabel]
    .filter(Boolean)
    .join(' às ');

  const eventoNome = payload.eventoNome ?? null;
  const funcaoNome = payload.funcaoNome ?? null;
  const ensaioInfo = resolveEventoEnsaioInfo({
    horarioEnsaio: typeof payload.horarioEnsaio === 'string' ? payload.horarioEnsaio : null,
    horarioEnsaioPadrao:
      typeof payload.horarioEnsaioPadrao === 'string'
        ? payload.horarioEnsaioPadrao
        : typeof payload.evento?.horarioEnsaioPadrao === 'string'
          ? payload.evento.horarioEnsaioPadrao
          : null,
    isLouvor: true,
    fallbackLabel: ENSAIO_FALLBACK_LABEL,
  });
  const horarioEnsaio = formatHorarioLabel(ensaioInfo.horario);

  const cardTitle = theme.label;

  // Subtítulo compacto numa única linha: "26/04 · 19h · Guitarrista"
  const metadataLabel = [occurrenceDateLabel, occurrenceTimeLabel, funcaoNome]
    .filter(Boolean)
    .join(' · ');

  const scheduleParts = [
    funcaoNome ? `para a função ${funcaoNome}` : null,
    eventoNome ? `em ${eventoNome}` : null,
    eventDateTimeLabel ? `no dia ${eventDateTimeLabel}` : null,
  ].filter(Boolean);
  const rehearsalSentence = horarioEnsaio ? `Ensaio às ${horarioEnsaio}.` : ENSAIO_FALLBACK_LABEL;
  const generatedSubtitle =
    scheduleParts.length > 0
      ? [`Você está escalado ${scheduleParts.join(' ')}.`, rehearsalSentence]
          .filter(Boolean)
          .join(' ')
      : null;
  const fallbackMsg = data.mensagem?.trim() || data.titulo?.trim() || null;
  const subtitle =
    generatedSubtitle || metadataLabel || fallbackMsg || 'Toque para ver os detalhes da escala.';

  const a11yLabel = [
    cardTitle + '.',
    subtitle ? subtitle + '.' : null,
    funcaoNome ? funcaoNome + '.' : null,
    occurrenceDateLabel ?? null,
    timeAgoA11y + '.',
  ]
    .filter(Boolean)
    .join(' ');

  const markerStyles = {
    funcao: [styles.markerText, { color: accentColor }],
    evento: [styles.markerText, { color: accentColor }],
    data: [styles.markerText, { color: accentColor }],
    ensaio: [styles.markerText, { color: accentColor }],
  };

  const subtitleNode = generatedSubtitle ? (
    <FancyText
      size='extraSmall'
      type='medium'
      style={[styles.messageText, { color: ColorUtils.withAlpha(Pallete.fonts.dark, 0.68) }]}
      accessibilityElementsHidden
    >
      {'Você está escalado'}
      {funcaoNome ? (
        <>
          {' para a função '}
          <FancyText size='extraSmall' type='bold' style={markerStyles.funcao}>
            {funcaoNome}
          </FancyText>
        </>
      ) : null}
      {eventoNome ? (
        <>
          {' em '}
          <FancyText size='extraSmall' type='bold' style={markerStyles.evento}>
            {eventoNome}
          </FancyText>
        </>
      ) : null}
      {eventDateTimeLabel ? (
        <>
          {' no dia '}
          <FancyText size='extraSmall' type='bold' style={markerStyles.data}>
            {eventDateTimeLabel}
          </FancyText>
        </>
      ) : null}
      {'. '}
      {horarioEnsaio ? (
        <>
          {'Ensaio às '}
          <FancyText size='extraSmall' type='bold' style={markerStyles.ensaio}>
            {horarioEnsaio}
          </FancyText>
          {'.'}
        </>
      ) : (
        <FancyText size='extraSmall' type='bold' style={markerStyles.ensaio}>
          {ENSAIO_FALLBACK_LABEL}
        </FancyText>
      )}
    </FancyText>
  ) : subtitle ? (
    <FancyText
      size='extraSmall'
      type='medium'
      style={[styles.messageText, { color: ColorUtils.withAlpha(Pallete.fonts.dark, 0.68) }]}
      accessibilityElementsHidden
    >
      {subtitle}
    </FancyText>
  ) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      onPress={() => onPress?.(data)}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={a11yLabel}
    >
      <FancyCardIcon
        backgroundColor={ColorUtils.withAlpha(accentColor, 0.045)}
        containerStyle={[
          styles.cardContainer,
          { borderColor: ColorUtils.withAlpha(accentColor, 0.08) },
        ]}
        centerContainerStyle={styles.centerContainer}
        contentContainerStyle={styles.cardContent}
        cardIcon={{
          ...theme.icon,
          backgroundColor: ColorUtils.withAlpha(accentColor, 0.14),
          color: accentColor,
        }}
        actionButtons={
          <View style={styles.chevronContainer}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='chevron-right'
              size={22}
              color={Pallete.fonts.inactive}
            />
          </View>
        }
        title={
          <View style={styles.mainBlock}>
            <View style={styles.titleRow}>
              <FancyText
                size={11.5}
                type='bold'
                numberOfLines={1}
                style={[styles.titleText, { color: accentColor }]}
              >
                {cardTitle}
              </FancyText>
              {timeAgoA11y ? (
                <>
                  <FancyText
                    size={10}
                    type='medium'
                    style={[styles.timeSeparator, { color: Pallete.fonts.inactive }]}
                    accessibilityElementsHidden
                  >
                    •
                  </FancyText>
                  <FancyText
                    size={10}
                    type='medium'
                    numberOfLines={1}
                    style={[styles.timeText, { color: Pallete.fonts.inactive }]}
                    accessibilityElementsHidden
                  >
                    {timeAgoA11y}
                  </FancyText>
                </>
              ) : null}
            </View>
            {subtitleNode}
          </View>
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 18,
  },
  pressed: {
    opacity: 0.85,
  },
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 7,
  },
  centerContainer: {
    gap: 0,
  },
  mainBlock: {
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    flexShrink: 1,
    opacity: 0.94,
    lineHeight: 18,
  },
  messageText: {
    lineHeight: 16,
  },
  markerText: {
    lineHeight: 16,
  },
  timeText: {
    lineHeight: 13,
    opacity: 0.75,
    flexShrink: 0,
    textAlignVertical: 'center',
  },
  timeSeparator: {
    lineHeight: 13,
    opacity: 0.55,
    flexShrink: 0,
  },
  chevronContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: 24,
  },
});
