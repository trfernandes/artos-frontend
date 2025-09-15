import { Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type DayProps = {
  day: number;
  onPress: () => void;
  selected?: boolean;
  type?: 'actual' | 'inactive' | 'default';
  showMarker?: boolean;
  markerType?: 'bottomPoint' | 'SurroundCircle';
};

export default function Day({ type = 'default', selected = false, showMarker = false, ...props }: DayProps) {
  let fontColor = Pallete.fonts.dark;
  if (type === 'default')
    if (selected) {
      fontColor = Pallete.fonts.light;
    } else {
      fontColor = Pallete.fonts.dark;
    }
  if (type === 'actual') {
    fontColor = Pallete.warning;
  } else if (type === 'inactive') {
    fontColor = Pallete.fonts.inactive2;
  }

  return (
    <Pressable style={[styles.container, selected && styles.selected]} onPress={props.onPress}>
      <FancyText size="small" type={selected || type === 'actual' ? 'bold' : 'medium'} color={fontColor}>
        {props.day}
      </FancyText>
      {showMarker && <View style={[styles.marked, showMarker && { backgroundColor: Pallete.warning }]} />}
    </Pressable>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    width: `${100 / 9}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderRadius: 100,
    borderWidth: DESIGN_MODE,
    borderColor: 'fuchsia',
  },
  selected: { backgroundColor: Pallete.primary },
  marked: { height: 5, width: 5, borderRadius: 100 },
  textActual: { color: Pallete.error },
  textInactive: { color: Pallete.fonts.inactive },
});
