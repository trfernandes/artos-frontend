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
  checkboxPosition?: 'left' | 'right';
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
  checkboxPosition = 'left',
  ...props
}: FancyCardCheckboxProps) {
  const checkboxElement = (
    <View style={styles.checkboxContainer}>
      <FancyCheckbox
        value={value}
        color={checkboxColor}
        size={25}
        iconSize={14}
        onChangeValue={onChangeValue}
      />
    </View>
  );

  const actionButtonsElement = isValidElement(actionButtons) ? (
    actionButtons
  ) : (
    <FancyActionButtons actions={actionButtons} />
  );

  return (
    <FancyBaseCard
      {...props}
      leftItem={checkboxPosition === 'left' ? checkboxElement : actionButtonsElement}
      rightItem={checkboxPosition === 'left' ? actionButtonsElement : checkboxElement}
    />
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    borderRadius: 100,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',    
  },
});
