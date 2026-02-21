import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import FancyText, { FancyTextProps } from '../FancyText';
import MiniDonut from './MiniDonut';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ColorUtils } from '../../utils/color_utils';

type ScaleFillIndicatorProps = {
  filledCount: number;
  totalCount: number;
  label: string;
  showContainer?: boolean;
  size?: 'compact' | 'default';
  trackColor?: string;
  centerColor?: string;
  textColor?: string;
  percentColor?: string;
  textType?: FancyTextProps['type'];
  textSize?: FancyTextProps['size'];
  donutSize?: number;
  donutStrokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

function getProgressColor(percent: number, palette: ThemePalette): string {
  if (percent >= 80) return palette.confirm;
  if (percent >= 50) return palette.warning;
  return palette.error;
}

export default function ScaleFillIndicator({
  filledCount,
  totalCount,
  label,
  showContainer = true,
  size = 'default',
  trackColor,
  centerColor,
  textColor,
  percentColor,
  textType = 'medium',
  textSize = 'extraSmall',
  donutSize,
  donutStrokeWidth,
  style,
}: ScaleFillIndicatorProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();
  const safeTotal = Math.max(totalCount, 0);
  const safeFilled = Math.max(Math.min(filledCount, safeTotal), 0);
  const percent = safeTotal > 0 ? Math.round((safeFilled / safeTotal) * 100) : 0;
  const isEmptyState = safeTotal <= 0;
  const resolvedTrackColor = trackColor ?? palette.disabled2;
  const progressColor = isEmptyState ? resolvedTrackColor : getProgressColor(percent, palette);

  const isCompact = size === 'compact';
  const resolvedDonutSize = donutSize ?? (isCompact ? 12 : 15);
  const donutStroke = donutStrokeWidth ?? (isCompact ? 2 : 2.5);

  const containerBackground = isDark ? palette.backgroundColor3 : '#F7F8FA';
  const resolvedCenterColor =
    centerColor ?? (showContainer ? containerBackground : palette.backgroundColor);
  const resolvedTextColor = textColor ?? palette.fonts.dark;
  const resolvedPercentColor =
    percentColor ?? (isEmptyState ? palette.fonts.inactive : progressColor);

  return (
    <View
      style={[
        styles.base,
        showContainer && styles.container,
        showContainer && isCompact && styles.containerCompact,
        showContainer && { backgroundColor: containerBackground },
        style,
      ]}
    >
      <MiniDonut
        percent={percent}
        color={progressColor}
        size={resolvedDonutSize}
        strokeWidth={donutStroke}
        trackColor={resolvedTrackColor}
        centerColor={resolvedCenterColor}
        style={styles.donut}
      />

      <FancyText
        type={textType}
        size={textSize}
        color={resolvedTextColor}
        style={styles.label}
        numberOfLines={1}
      >
        {`${safeFilled}/${safeTotal} ${label}`}
      </FancyText>

      <FancyText type={textType} size={textSize} color={resolvedPercentColor}>
        {`${percent}%`}
      </FancyText>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    container: {
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.8),
    },
    containerCompact: {
      paddingVertical: 6,
      paddingHorizontal: 9,
    },
    label: {
      flex: 1,
    },
    donut: {
      marginLeft: 2,
    },
  });
}
