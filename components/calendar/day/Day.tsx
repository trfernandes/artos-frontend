import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

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
  const isDisabled = disabled;
  const isSelected = selected;
  const isToday = type === 'actual';
  const isInactive = type === 'inactive';

  const textColor = useMemo(() => {
    if (isSelected && markerType !== 'SurroundCircle') return Pallete.fonts.light;
    if (isToday) return Pallete.warning;
    if (isInactive) return Pallete.fonts.inactive2;
    return Pallete.fonts.dark;
  }, [isSelected, isToday, isInactive, markerType]);

  const textWeight: 'bold' | 'semiBold' = isSelected ? 'bold' : 'semiBold';

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    isSelected && markerType !== 'SurroundCircle' && { backgroundColor: Pallete.primary },
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
        backgroundColor: resolvedMarkerColor || Pallete.primary,
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

    if (Array.isArray(markerColor)) {
      return markerColor.map((c, index) => (
        <View key={`marker-${index}`} style={[styles.marked, c ? { backgroundColor: c } : null]} />
      ));
    }

    return <View style={[styles.marked, markerColor ? { backgroundColor: markerColor } : null]} />;
  };

  return (
    <TouchableOpacity style={containerStyles} onPress={handlePress} disabled={isDisabled}>
      {showCircle ? (
        <View style={circleStyles}>
          <FancyText size='medium' type='bold' color={isDisabled ? Pallete.fonts.inactive : Pallete.fonts.light}>
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

const styles = StyleSheet.create({
  container: {
    width: DAY_WIDTH,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    // borderWidth: 1,
  },
  circle: {
    width: '80%',
    height: '80%',
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
    backgroundColor: Pallete.disabled3,
  },
  marked: {
    marginTop: 1,
    height: 3,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: Pallete.warning,
  },
});

export default React.memo(DayComponent);
