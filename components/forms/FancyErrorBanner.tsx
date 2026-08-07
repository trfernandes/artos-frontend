import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export default function FancyErrorBanner(props: { message: string }) {
  const Pallete = usePallete();

  if (!props.message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.12),
          borderColor: ColorUtils.withAlpha(Pallete.error, 0.28),
        },
      ]}
    >
      {DefaultIcons.Custom({
        library: 'MaterialCommunityIcons',
        name: 'alert-circle-outline',
        size: 18,
        color: Pallete.error,
      })}
      <FancyText size='extraSmall' type='medium' color={Pallete.error} style={styles.text}>
        {props.message}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});
