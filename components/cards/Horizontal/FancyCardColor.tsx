import { isValidElement, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { ActionButtonProps, FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';

export type FancyCardColorProps = {
  color: string;
  actionButtons?: ActionButtonProps | ActionButtonProps[] | ReactNode;
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

export default function FancyCardColor(props: FancyCardColorProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={<View style={[styles.colorContainer, { backgroundColor: props.color || Pallete.primary }]}></View>}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

const styles = StyleSheet.create({
  colorContainer: {
    borderRadius: 100,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
