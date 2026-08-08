import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import DefaultIcons from '../FancyIcons';
import FancyText from '../FancyText';
import { ColorUtils } from '../../utils/color_utils';
import { usePallete } from '../../hooks/usePallete';
import {
  BOLD_FONT,
  MEDIUM_SIZE_FONT,
  SMALL_SIZE_FONT,
  EXTRA_SMALL_SIZE_FONT,
} from '../../constants/font';

export type EventoCardContentProps = {
  timeRangeText: string;
  countdownLabel: string;
  title: string;
  eventColor: string;
  metaPrimary?: string;
  metaSecondary?: string;
  isAccordion?: boolean;
  isExpanded?: boolean;
  isCancelled?: boolean;
};

export default function EventoCardContent({
  timeRangeText,
  countdownLabel,
  title,
  eventColor,
  metaPrimary,
  metaSecondary,
  isAccordion = false,
  isExpanded = false,
  isCancelled = false,
}: EventoCardContentProps) {
  const palette = usePallete();
  const isDark = palette.backgroundColor === '#121212';
  const ui = useMemo(
    () => ({
      accentText: isDark
        ? ColorUtils.lightenColor(eventColor, 0.22)
        : ColorUtils.darkenColor(eventColor, 0.32),
      accentSoft: ColorUtils.withAlpha(eventColor, isDark ? 0.16 : 0.065),
      chipBorder: ColorUtils.withAlpha(eventColor, isDark ? 0.28 : 0.11),
      iconBg: ColorUtils.withAlpha(eventColor, isDark ? 0.18 : 0.075),
    }),
    [eventColor, isDark],
  );

  return (
    <View style={styles.root}>
      <View style={styles.rowBetween}>
        <View style={styles.timeRow}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='clock-outline'
            size={12}
            color={ui.accentText}
          />
          <FancyText
            size='small'
            type='semiBold'
            style={[styles.timeText, { color: ui.accentText }]}
          >
            {timeRangeText}
          </FancyText>
        </View>

        <View style={styles.rightActions}>
          <View
            style={[
              styles.countdownBadge,
              isCancelled
                ? {
                    backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.1),
                    borderColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.25),
                  }
                : { backgroundColor: ui.accentSoft, borderColor: ui.chipBorder },
            ]}
          >
            <FancyText
              size='extraSmall'
              type='semiBold'
              style={[
                styles.countdownText,
                { color: isCancelled ? palette.fonts.inactive : ui.accentText },
              ]}
            >
              {isCancelled ? 'Cancelado' : countdownLabel}
            </FancyText>
          </View>
          <View style={[styles.actionButton, { backgroundColor: ui.iconBg }]}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name={isAccordion ? (isExpanded ? 'chevron-up' : 'chevron-down') : 'chevron-right'}
              size={15}
              color={ui.accentText}
            />
          </View>
        </View>
      </View>

      <FancyText
        size='medium'
        type='bold'
        style={[
          styles.title,
          isCancelled && { textDecorationLine: 'line-through', color: palette.fonts.inactive },
        ]}
        numberOfLines={isAccordion ? 1 : 2}
        color={isCancelled ? palette.fonts.inactive : palette.fonts.dark}
      >
        {title}
      </FancyText>

      {metaPrimary || metaSecondary ? (
        <View style={styles.metaLine}>
          {metaPrimary ? (
            <View style={styles.metaItem}>
              <View style={[styles.metaDot, { backgroundColor: eventColor }]} />
              <FancyText
                size='extraSmall'
                type='semiBold'
                style={[styles.metaText, { color: ui.accentText }]}
                numberOfLines={1}
              >
                {metaPrimary}
              </FancyText>
            </View>
          ) : null}

          {metaPrimary && metaSecondary ? (
            <View
              style={[
                styles.metaSeparator,
                { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.5) },
              ]}
            />
          ) : null}

          {metaSecondary ? (
            <View style={styles.metaItem}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='music-note-eighth'
                size={11}
                color={ui.accentText}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                style={[styles.metaText, { color: ui.accentText }]}
                numberOfLines={1}
              >
                {metaSecondary}
              </FancyText>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minWidth: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  timeText: {
    fontFamily: BOLD_FONT,
    lineHeight: SMALL_SIZE_FONT + 1,
    letterSpacing: 0.15,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  countdownBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minHeight: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: EXTRA_SMALL_SIZE_FONT - 0.8,
    lineHeight: EXTRA_SMALL_SIZE_FONT,
  },
  actionButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: BOLD_FONT,
    fontSize: MEDIUM_SIZE_FONT,
    lineHeight: MEDIUM_SIZE_FONT + 2,
    letterSpacing: -0.1,
    marginTop: -1,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
    flexWrap: 'nowrap',
    marginTop: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    flexShrink: 1,
  },
  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
  metaText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    flexShrink: 1,
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 99,
    flexShrink: 0,
  },
});
