import { isValidElement, ReactNode } from 'react';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { ActionButtonProps, FancyActionButtons } from './FancyCardActionButtons';
import { View } from 'react-native';

export type FancyCardSimpleProps = {
  letter?: string;
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

export default function FancyCardSimple(props: FancyCardSimpleProps) {
  return (
    <FancyBaseCard
      {...props}
      containerStyle={[props.containerStyle, { paddingLeft: 0 }]}
      leftItem={<View style={{ width: 0 }} />}
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
