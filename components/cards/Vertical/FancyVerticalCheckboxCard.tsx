import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import FancyCheckbox from '../../FancyCheckbox';
import { ImageComponent } from './FancyVerticalImageCard';

export type FancyVerticalCheckboxCardProps = {
  value: boolean;
  image?: string | number;
  onChangeValue?: (value: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle'>;

export default function FancyVerticalCheckboxCard({
  image,
  value,
  onChangeValue,
  ...props
}: FancyVerticalCheckboxCardProps) {
  return (
    <TouchableOpacity onPress={() => onChangeValue?.(!value)}>
      <FancyVerticalCard
        cardHeight={100}
        topLeftElement={<CheckboxComponent value={value} />}
        topElement={<ImageComponent source={image} />}
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
      <FancyCheckbox value={value} size={13} iconSize={8} onChangeValue={() => onChangeValue?.(!value)} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {},
});
