import { isValidElement, ReactNode } from 'react';
import { ActionButton, FancyActionButtons } from './FancyCardActionButtons';
import { StyleSheet, View } from 'react-native';
import FancyCheckbox from '../../FancyCheckbox';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';

export type FancyCardCheckboxProps = {
  value: boolean;
  actionButtons?: ActionButton | ActionButton[] | ReactNode;
} & Pick<
  FancyBaseCardProps,
  | 'title'
  | 'subtitle'
  | 'additionalData1'
  | 'additionalData2'
  | 'content'
  | 'containerStyle'
  | 'contentContainerStyle'  | 'isCollapsable' 
>;

export default function FancyCardCheckBox(props: FancyCardCheckboxProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={
        <View style={styles.checkboxContainer}>
          <FancyCheckbox value={props.value} size={30} iconSize={16} />
        </View>
      }
      rightItem={
        isValidElement(props.actionButtons) ? (
          props.actionButtons
        ) : (
          <FancyActionButtons actions={props.actionButtons} />
        )
      }
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
