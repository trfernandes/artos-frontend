import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type DayProps = {
  day: number;
  onPress?: () => void;
  selected?: boolean;
  type?: 'actual' | 'inactive' | 'default';
  showMarker?: boolean;
  markerType?: 'bottomPoint' | 'SurroundCircle';
  markerColor?: string;
  disabled?: boolean;
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

  let fontColor = Pallete.fonts.dark;
  if (isSelected) {
    fontColor = Pallete.fonts.light;
  } else if (type === 'actual') {
    fontColor = Pallete.warning;
  } else if (type === 'inactive') {
    fontColor = Pallete.fonts.inactive2;
  }

  const textType: 'bold' | 'semiBold' = isSelected ? 'bold' : 'semiBold';

  const containerStyles: StyleProp<ViewStyle> = [styles.container];

  if (isSelected && markerType !== 'SurroundCircle') {
    containerStyles.push({ backgroundColor: markerColor ?? Pallete.primary });
  }

  const showCircle = markerType === 'SurroundCircle' && isSelected;
  const circleStyles: StyleProp<ViewStyle> = [styles.circle];
  if (showCircle && !isDisabled) {
    circleStyles.push({ backgroundColor: markerColor ?? Pallete.primary });
  }
  if (showCircle && isDisabled) {
    circleStyles.push(styles.circleDisabled);
  }

  const renderMarker = showMarker && markerType === 'bottomPoint';

  const handlePress = () => {
    if (isDisabled) return;
    onPress?.();
  };

  return (
    <Pressable style={containerStyles} onPress={handlePress} disabled={isDisabled}>
      {showCircle ? (
        <View style={circleStyles}>
          <FancyText size="medium" type="bold" color={isDisabled ? Pallete.fonts.inactive : Pallete.fonts.light}>
            {day}
          </FancyText>
        </View>
      ) : (
        <FancyText size="medium" type={textType} color={fontColor}>
          {day}
        </FancyText>
      )}
      {renderMarker && <View style={[styles.marked, markerColor ? { backgroundColor: markerColor } : null]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: `${100 / 11}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  circle: {
    width: '90%',
    height: '90%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDisabled: {
    backgroundColor: Pallete.disabled3,
  },
  marked: {
    marginTop: 6,
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: Pallete.warning,
  },
});

export default React.memo(DayComponent);
