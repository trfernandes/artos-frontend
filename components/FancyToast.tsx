import { View, Pressable, StyleSheet } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { Pallete } from '../constants/colors';
import { DefaultIconsNames } from '../constants/icons';
import FancyButton from './buttons/FancyButton';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import FancyText from './FancyText';
import { ColorUtils } from '../utils/color_utils';

interface FancyToastProps extends ToastConfigParams<any> {
  icon: CustomIconProps;
  color: string;
  lightColorPercent: number;
}

export default function FancyToast(props: FancyToastProps) {
  const hsl = ColorUtils.hexToHsl(props.color);
  const [h, s, l] = hsl || [0, 0, 0];
  const newLightness = Math.min(100, l + props.lightColorPercent);
  const newHex = ColorUtils.hslToHex(h, s, newLightness);

  return (
    <Pressable style={styles.container} onPress={props.onPress}>
      <View style={[styles.content, { backgroundColor: newHex, borderColor: props.color }]}>
        <View style={[styles.iconContainer, { backgroundColor: props.color }]}>
          <DefaultIcons.Custom {...props.icon} color="white" />
        </View>
        <View style={{ width: 15 }} />
        <View style={styles.textsContainer}>
          {props.text1 && (
            <FancyText size="small" type="semiBold" style={[styles.text, props.text2Style]}>
              {props.text1}
            </FancyText>
          )}
          {props.text2 && (
            <FancyText size="small" type="medium" style={[styles.text, props.text2Style]}>
              {props.text2}
            </FancyText>
          )}
        </View>
        <View style={{ width: 5 }} />
        <FancyButton
          mode={'icon'}
          type="text"
          onPress={() => props.hide()}
          icon={{ ...DefaultIconsNames.cancel, color: props.color, size: 22 }}
          containerStyle={{ height: 40, minWidth: 30, width: 30, borderWidth: 0 }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 25, width: '90%', zIndex: 1000000 },
  content: {
    ...Pallete.shadows[200],
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 15,
    paddingVertical: 15,
    paddingLeft: 12,
    paddingRight: 10,
  },
  textsContainer: { flex: 1, gap: 2 },
  text: { lineHeight: 15, borderWidth: 0 },
  iconContainer: {
    height: 35,
    width: 35,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
