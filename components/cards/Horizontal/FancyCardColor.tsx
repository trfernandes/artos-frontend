import { isValidElement, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { ActionButtonProps, FancyActionButtons } from './FancyCardActionButtons';
import { usePallete } from '../../../hooks/usePallete';

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
  const palette = usePallete();

  return (
    <FancyBaseCard
      {...props}
      leftItem={
        <View
          style={[styles.colorContainer, { backgroundColor: props.color || palette.primary }]}
        ></View>
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
  colorContainer: {
    width: 3,
    flex: 1,
    marginVertical: 4,
    borderRadius: 3,
  },
});
