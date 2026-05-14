import { useMemo } from 'react';
import { EscalaItemDataType } from '../app/(app)/(drawer)/ministerios/escalas/details';
import { usePallete } from './usePallete';
import { useAppTheme } from './useAppTheme';
import { ColorUtils } from '../utils/color_utils';
import { combineAppDateWithTime, APP_TZ } from '../utils/date_utils';
import { EscalaItemStatusEnum } from '../domain/enums/Escala/escala-item-status.enum';
import { formatInTimeZone } from 'date-fns-tz';

export function useEventoHeaderState(data: EscalaItemDataType) {
  const palette = usePallete();
  const { isDark } = useAppTheme();

  const hasEventPassed = useMemo(() => {
    const startTime = data.evento.dataInicio;
    const endTime = data.evento.dataTermino;

    // Extract hours in SP timezone (not device-local) to detect midnight-crossing events
    const spStartH = startTime ? Number(formatInTimeZone(startTime, APP_TZ, 'H')) : 0;
    const spStartM = startTime ? Number(formatInTimeZone(startTime, APP_TZ, 'm')) : 0;
    const spEndH = endTime ? Number(formatInTimeZone(endTime, APP_TZ, 'H')) : 0;
    const spEndM = endTime ? Number(formatInTimeZone(endTime, APP_TZ, 'm')) : 0;

    const crossesMidnight = spEndH < spStartH || (spEndH === spStartH && spEndM <= spStartM);

    // Combine occurrence date + end time in SP timezone → correct UTC instant
    const endAt = combineAppDateWithTime(
      data.dataOcorrencia,
      endTime ?? startTime,
      crossesMidnight ? 1 : 0,
    );
    return endAt.getTime() < Date.now();
  }, [data.dataOcorrencia, data.evento.dataInicio, data.evento.dataTermino]);

  const { borderColor, expandableIconColor, headerGradientColors, headerBackground } =
    useMemo(() => {
      const baseAccentColor = data.evento.cor || palette.primary;
      const accentHsl = ColorUtils.hexToHsl(baseAccentColor);
      const accentColor =
        hasEventPassed && accentHsl
          ? ColorUtils.hslToHex(
              accentHsl[0],
              Math.max(10, Math.round(accentHsl[1] * 0.26)),
              Math.min(88, accentHsl[2] + 6),
            )
          : baseAccentColor;

      const darkStart = isDark
        ? ColorUtils.withAlpha(accentColor, 0.32)
        : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.74 : 0.62);
      const midStart = isDark
        ? ColorUtils.withAlpha(accentColor, 0.26)
        : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.81 : 0.72);
      const mid = isDark
        ? ColorUtils.withAlpha(accentColor, 0.22)
        : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.84 : 0.76);
      const midEnd = isDark
        ? ColorUtils.withAlpha(accentColor, 0.18)
        : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.87 : 0.8);
      const lightEnd = isDark
        ? ColorUtils.withAlpha(accentColor, 0.16)
        : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.9 : 0.84);

      return {
        borderColor: accentColor,
        expandableIconColor:
          ColorUtils.getTextColorForBackground(accentColor) === '#FFFFFF'
            ? palette.fonts.light
            : ColorUtils.darkenColor(accentColor, 0.25),
        headerGradientColors: [lightEnd, midEnd, mid, midStart, darkStart] as string[],
        headerBackground: lightEnd,
      };
    }, [data.evento.cor, hasEventPassed, isDark, palette.primary, palette.fonts.light]);

  const { eventConfirmed, eventTotal } = useMemo(() => {
    const assigned = data.equipe.filter((item) => Boolean(item.voluntario?.voluntarioId));
    const confirmed = assigned.filter(
      (item) => item.status === EscalaItemStatusEnum.Confirmado,
    ).length;
    return { eventConfirmed: confirmed, eventTotal: assigned.length };
  }, [data.equipe]);

  const eventMetaColor = hasEventPassed
    ? ColorUtils.withAlpha(palette.fonts.dark, 0.52)
    : ColorUtils.withAlpha(palette.fonts.dark, 0.7);

  const eventTitleColor = hasEventPassed
    ? ColorUtils.withAlpha(palette.fonts.dark, 0.76)
    : palette.fonts.dark;

  const eventProgressColor = hasEventPassed
    ? ColorUtils.withAlpha(ColorUtils.darkenColor(borderColor, 0.08), 0.7)
    : ColorUtils.darkenColor(data.evento.cor || palette.primary, 0.25);

  return {
    hasEventPassed,
    borderColor,
    expandableIconColor,
    headerGradientColors,
    headerBackground,
    eventConfirmed,
    eventTotal,
    eventMetaColor,
    eventTitleColor,
    eventProgressColor,
  };
}
