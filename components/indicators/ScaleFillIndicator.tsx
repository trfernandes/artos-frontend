import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText, { FancyTextProps } from '../FancyText';
import MiniDonut from './MiniDonut';

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

function getProgressColor(percent: number): string {
  if (percent >= 80) return Pallete.confirm;
  if (percent >= 50) return Pallete.warning;
  return Pallete.error;
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
  const safeTotal = Math.max(totalCount, 0);
  const safeFilled = Math.max(Math.min(filledCount, safeTotal), 0);
  const percent = safeTotal > 0 ? Math.round((safeFilled / safeTotal) * 100) : 0;
  const isEmptyState = safeTotal <= 0;
  const resolvedTrackColor = trackColor ?? Pallete.disabled2;
  const progressColor = isEmptyState ? resolvedTrackColor : getProgressColor(percent);

  const isCompact = size === 'compact';
  const resolvedDonutSize = donutSize ?? (isCompact ? 12 : 15);
  const donutStroke = donutStrokeWidth ?? (isCompact ? 2 : 2.5);

  const containerBackground = '#F7F8FA';
  const resolvedCenterColor = centerColor ?? (showContainer ? containerBackground : Pallete.backgroundColor);
  const resolvedTextColor = textColor ?? Pallete.fonts.dark;
  const resolvedPercentColor = percentColor ?? (isEmptyState ? Pallete.fonts.inactive : progressColor);

  return (
    <View
      style={[
        styles.base,
        showContainer && styles.container,
        showContainer && isCompact && styles.containerCompact,
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

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  container: {
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
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
