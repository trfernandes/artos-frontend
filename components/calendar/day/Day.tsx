import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

export type DayProps = {
  day: number;
  onPress?: () => void;
  selected?: boolean;
  type?: 'actual' | 'inactive' | 'default';
  showMarker?: boolean;
  markerType?: 'bottomPoint' | 'SurroundCircle';
  disabled?: boolean;
  markerColor?: string | string[];
  visualStyle?: 'default' | 'agendaPremium';
};

function DayComponent({
  day,
  onPress,
  type = 'default',
  selected = false,
  showMarker = false,
  markerType = 'bottomPoint',
  markerColor,
  disabled = false,
  visualStyle = 'default',
}: DayProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled;
  const isSelected = selected;
  const isToday = type === 'actual';
  const isInactive = type === 'inactive';
  const isAgendaPremium = visualStyle === 'agendaPremium';

  const textColor = useMemo(() => {
    if (isSelected && markerType !== 'SurroundCircle') return palette.fonts.light;
    if (isToday) return palette.warning;
    if (isInactive) return palette.fonts.inactive2;
    return palette.fonts.dark;
  }, [isSelected, isToday, isInactive, markerType, palette]);

  const textWeight: 'bold' | 'semiBold' = isSelected || isToday ? 'bold' : 'semiBold';

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    isAgendaPremium ? styles.containerAgendaPremium : null,
  ];

  // 👇 pega a cor vinda das markedDates (string ou primeiro item do array)
  const resolvedMarkerColor = useMemo(() => {
    if (Array.isArray(markerColor)) return markerColor[0];
    return markerColor;
  }, [markerColor]);

  const showCircle = markerType === 'SurroundCircle' && isSelected;
  const showSelectedBubble = markerType === 'bottomPoint' && isSelected;
  const showSelectedState = showCircle || showSelectedBubble;
  const shouldRenderBottomMarker = showMarker && markerType === 'bottomPoint';
  const showInlineSelectedMarkers = false;
  const showTodaySurface = isAgendaPremium && isToday && !showSelectedState;

  const circleStyles: StyleProp<ViewStyle> = [
    styles.circle,
    isAgendaPremium ? styles.circleAgendaPremium : null,
    showSelectedState &&
      !isDisabled && {
        backgroundColor: showCircle ? resolvedMarkerColor || palette.primary : palette.primary,
      },
    showSelectedState && isDisabled && styles.circleDisabled,
    showTodaySurface && {
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.06),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
    },
    showSelectedState && isAgendaPremium && styles.circleAgendaPremiumSelected,
  ];

  const shouldRenderExternalMarker = shouldRenderBottomMarker && !showSelectedBubble;

  const handlePress = () => {
    if (isDisabled) return;
    onPress?.();
  };

  const renderMarkers = (inline = false) => {
    if (!shouldRenderBottomMarker) return null;

    const resolveColor = (c?: string) => {
      if (inline || isSelected) return palette.fonts.light;
      return c || undefined;
    };

    const markerStyle = inline ? styles.selectedMarked : styles.marked;
    const premiumMarkerStyle = inline
      ? styles.selectedMarkedAgendaPremium
      : styles.markedAgendaPremium;
    const baseMarkerStyle = isAgendaPremium ? premiumMarkerStyle : markerStyle;

    const normalizedColors = Array.isArray(markerColor) ? markerColor : [markerColor];

    if (Array.isArray(markerColor)) {
      return normalizedColors.map((c, index) => (
        <View
          key={`marker-${index}`}
          style={[baseMarkerStyle, { backgroundColor: resolveColor(c) }]}
        />
      ));
    }

    return <View style={[baseMarkerStyle, { backgroundColor: resolveColor(markerColor) }]} />;
  };

  return (
    <TouchableOpacity style={containerStyles} onPress={handlePress} disabled={isDisabled}>
      {showSelectedState ? (
        <View style={circleStyles}>
          <FancyText
            size='medium'
            type='bold'
            color={isDisabled ? palette.fonts.inactive : palette.fonts.light}
          >
            {day}
          </FancyText>
          {showInlineSelectedMarkers && (
            <View style={styles.selectedMarkerContainer}>{renderMarkers(true)}</View>
          )}
        </View>
      ) : (
        <FancyText size='small' type={textWeight} color={textColor}>
          {day}
        </FancyText>
      )}

      {shouldRenderExternalMarker && <View style={styles.markerContainer}>{renderMarkers()}</View>}
    </TouchableOpacity>
  );
}

const DAY_WIDTH = `${100 / 9}%`;
const DAY_WIDTH_PREMIUM = `${100 / 7}%`;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: DAY_WIDTH,
      aspectRatio: 0.86,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      // borderWidth: 1,
    },
    containerAgendaPremium: {
      width: DAY_WIDTH_PREMIUM,
      aspectRatio: 1.16,
      paddingVertical: 0,
    },
    circle: {
      width: '78%',
      aspectRatio: 1,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleAgendaPremium: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    circleAgendaPremiumSelected: {
      shadowColor: palette.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 7,
      elevation: 2,
    },
    circleWithMarkers: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    },
    markerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 3,
      paddingBottom: 1,
      marginTop: 1,
      marginHorizontal: 4,
    },
    selectedMarkerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 3,
    },
    circleDisabled: {
      backgroundColor: palette.disabled3,
    },
    marked: {
      marginTop: 1,
      height: 4,
      width: 4,
      borderRadius: 2,
      backgroundColor: palette.warning,
    },
    selectedMarked: {
      height: 4,
      width: 4,
      borderRadius: 2,
      backgroundColor: palette.fonts.light,
    },
    markedAgendaPremium: {
      height: 5,
      width: 5,
      borderRadius: 999,
      backgroundColor: palette.warning,
    },
    selectedMarkedAgendaPremium: {
      height: 4,
      width: 4,
      borderRadius: 999,
      backgroundColor: palette.fonts.light,
    },
  });
}

export default React.memo(DayComponent);
