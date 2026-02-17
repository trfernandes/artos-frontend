import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type DayProps = {
  day: number;
  onPress?: () => void;
  selected?: boolean;
  type?: 'actual' | 'inactive' | 'default';
  showMarker?: boolean;
  markerType?: 'bottomPoint' | 'SurroundCircle';
  disabled?: boolean;
  markerColor?: string | string[];
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
}: DayProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled;
  const isSelected = selected;
  const isToday = type === 'actual';
  const isInactive = type === 'inactive';

  const textColor = useMemo(() => {
    if (isSelected && markerType !== 'SurroundCircle') return palette.fonts.light;
    if (isToday) return palette.warning;
    if (isInactive) return palette.fonts.inactive2;
    return palette.fonts.dark;
  }, [isSelected, isToday, isInactive, markerType, palette]);

  const textWeight: 'bold' | 'semiBold' = isSelected ? 'bold' : 'semiBold';

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    isSelected && markerType !== 'SurroundCircle' && { backgroundColor: palette.primary },
  ];

  // 👇 pega a cor vinda das markedDates (string ou primeiro item do array)
  const resolvedMarkerColor = useMemo(() => {
    if (Array.isArray(markerColor)) return markerColor[0];
    return markerColor;
  }, [markerColor]);

  const showCircle = markerType === 'SurroundCircle' && isSelected;

  const circleStyles: StyleProp<ViewStyle> = [
    styles.circle,
    showCircle &&
      !isDisabled && {
        backgroundColor: resolvedMarkerColor || palette.primary,
      },
    showCircle && isDisabled && styles.circleDisabled,
  ];

  const shouldRenderBottomMarker = showMarker && markerType === 'bottomPoint';

  const handlePress = () => {
    if (isDisabled) return;
    onPress?.();
  };

  const renderMarkers = () => {
    if (!shouldRenderBottomMarker) return null;

    const resolveColor = (c?: string) => {
      if (isSelected) return palette.fonts.light;
      return c || undefined;
    };

    if (Array.isArray(markerColor)) {
      return markerColor.map((c, index) => (
        <View key={`marker-${index}`} style={[styles.marked, { backgroundColor: resolveColor(c) }]} />
      ));
    }

    return <View style={[styles.marked, { backgroundColor: resolveColor(markerColor) }]} />;
  };

  return (
    <TouchableOpacity style={containerStyles} onPress={handlePress} disabled={isDisabled}>
      {showCircle ? (
        <View style={circleStyles}>
          <FancyText size='medium' type='bold' color={isDisabled ? palette.fonts.inactive : palette.fonts.light}>
            {day}
          </FancyText>
        </View>
      ) : (
        <FancyText size='medium' type={textWeight} color={textColor}>
          {day}
        </FancyText>
      )}

      {showMarker && <View style={styles.markerContainer}>{renderMarkers()}</View>}
    </TouchableOpacity>
  );
}

const DAY_WIDTH = `${100 / 9}%`; // mantém alinhado com o header (do jeito que você definiu)

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: DAY_WIDTH,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      // borderWidth: 1,
    },
    circle: {
      width: '68%',
      height: '68%',
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 2,
      paddingBottom: 2,
      marginHorizontal: 6,
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
  });
}

export default React.memo(DayComponent);
