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
    <FancyVerticalCard
      topLeftElement={<CheckboxComponent value={value} onChangeValue={onChangeValue} />}
      topElement={<ImageComponent source={image} />}
      {...props}
    />
  );
}

function CheckboxComponent({ value, onChangeValue }: { value: boolean; onChangeValue?: (value: boolean) => void }) {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onChangeValue?.(!value)}>
      <FancyCheckbox value={value} size={16} iconSize={10} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: { padding: 5 },
});
