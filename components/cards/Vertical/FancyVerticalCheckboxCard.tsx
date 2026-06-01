import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import FancyCheckbox from '../../FancyCheckbox';
import { ImageComponent } from './FancyVerticalImageCard';
import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { EXTRA_SMALL_SIZE_FONT } from '../../../constants/font';

export type FancyVerticalCheckboxCardProps = {
  value: boolean;
  source?: ImageSourcePropType;
  onChangeValue?: (value: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle'>;

export default function FancyVerticalCheckboxCard({
  source,
  value,
  onChangeValue,
  ...props
}: FancyVerticalCheckboxCardProps) {
  const palette = usePallete();

  return (
    <TouchableOpacity onPress={() => onChangeValue?.(!value)}>
      <FancyVerticalCard
        cardHeight={100}
        topLeftElement={<CheckboxComponent value={value} />}
        topElement={source && <ImageComponent source={source} />}
        contentContainerStyle={styles.contentContainer}
        bottomElement={
          <View style={styles.bottomContent}>
            {props.title && (
              <FancyText
                size='extraSmall'
                type='bold'
                numberOfLines={2}
                style={[styles.titleText, { color: palette.fonts.dark }]}
              >
                {props.title}
              </FancyText>
            )}
            {props.subtitle && (
              <FancyText
                size='extraSmall'
                type='semiBold'
                numberOfLines={1}
                color={palette.fonts.inactive}
                style={styles.subtitleText}
              >
                {props.subtitle}
              </FancyText>
            )}
          </View>
        }
        {...props}
      />
    </TouchableOpacity>
  );
}

function CheckboxComponent({
  value,
  onChangeValue,
}: {
  value: boolean;
  onChangeValue?: (value: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.checkboxContainer}>
      <FancyCheckbox
        value={value}
        size={13}
        iconSize={8}
        onChangeValue={() => onChangeValue?.(!value)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {},
  contentContainer: {
    gap: 5,
  },
  bottomContent: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  titleText: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: EXTRA_SMALL_SIZE_FONT + 1,
    minHeight: EXTRA_SMALL_SIZE_FONT * 2 + 4,
  },
  subtitleText: {
    textAlign: 'center',
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
  },
});
