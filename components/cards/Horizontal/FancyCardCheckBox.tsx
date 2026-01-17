import { isValidElement, ReactNode } from 'react';
import { ActionButtonProps, FancyActionButtons } from './FancyCardActionButtons';
import { StyleSheet, View } from 'react-native';
import FancyCheckbox from '../../FancyCheckbox';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';

export type FancyCardCheckboxProps = {
  value: boolean;
  onChangeValue: (value: boolean) => void;
  actionButtons?: ActionButtonProps | ActionButtonProps[] | ReactNode;
  checkboxColor?: string;
} & Pick<
  FancyBaseCardProps,
  | 'title'
  | 'subtitle'
  | 'additionalData1'
  | 'additionalData2'
  | 'content'
  | 'containerStyle'
  | 'contentContainerStyle'
  | 'isCollapsable'
    | 'backgroundColor'
>;

export default function FancyCardCheckBox({
  checkboxColor,
  value,
  onChangeValue,
  actionButtons,
  ...props
}: FancyCardCheckboxProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={
        <View style={styles.checkboxContainer}>
          <FancyCheckbox value={value} color={checkboxColor} size={30} iconSize={16} onChangeValue={onChangeValue} />
        </View>
      }
      rightItem={isValidElement(actionButtons) ? actionButtons : <FancyActionButtons actions={actionButtons} />}
    />
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    borderRadius: 100,
    // marginLeft: 15,
    marginRight: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
