import { StyleSheet, View } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import DefaultIcons from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export type QuizAnswerOptionProps = {
  label: string;
  number: number;
  icon: string;
  selected: boolean;
  onPress: () => void;
};

export default function QuizAnswerOption({
  label,
  number,
  icon,
  selected,
  onPress,
}: QuizAnswerOptionProps) {
  const Pallete = usePallete();

  return (
    <View
      style={[
        styles.wrapper,
        selected ? Pallete.shadows[200] : Pallete.shadows[100],
        {
          backgroundColor: selected ? Pallete.primary : Pallete.backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: selected
              ? ColorUtils.withAlpha(Pallete.fonts.light, 0.2)
              : Pallete.backgroundColor2,
          },
        ]}
      >
        {DefaultIcons.Custom({
          library: 'MaterialCommunityIcons',
          name: icon,
          size: 20,
          color: selected ? Pallete.fonts.light : Pallete.icons.inactive,
        })}
      </View>
      <FancyButton
        type='text'
        label={`${number}.  ${label}`}
        onPress={onPress}
        containerStyle={styles.button}
        labelStyle={[styles.label, { color: selected ? Pallete.fonts.light : Pallete.fonts.dark }]}
        labelProps={{ numberOfLines: 2, adjustsFontSizeToFit: false }}
        icon={
          selected
            ? {
                library: 'MaterialCommunityIcons',
                name: 'check-circle',
                color: Pallete.fonts.light,
                size: 20,
              }
            : undefined
        }
        iconPosition='right'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingLeft: 16,
    paddingRight: 4,
    gap: 8,
    overflow: 'hidden',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    width: undefined,
    minWidth: undefined,
    height: undefined,
    minHeight: 52,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  label: {
    flex: 1,
    textAlign: 'left',
  },
});
