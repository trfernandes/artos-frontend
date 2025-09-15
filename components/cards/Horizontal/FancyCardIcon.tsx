import { StyleSheet, View } from 'react-native';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { isValidElement, ReactNode } from 'react';
import { ActionButton, FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';

export type FancyCardIconProps = {
  cardIcon?: CustomIconProps;
  actionButtons?: ActionButton | ActionButton[] | ReactNode;
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
>;

export default function FancyCardIcon(props: FancyCardIconProps) {
  return (
    <FancyBaseCard
      {...props}
      containerStyle={[props.containerStyle, { paddingVertical: 10 }]}
      leftItem={props.cardIcon ? <CardIcon {...props.cardIcon} /> : undefined}
      rightItem={
        isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />
      }
    />
  );
}

function CardIcon(icon: CustomIconProps) {
  return (
    <View
      style={[
        styles.iconContainer,
        { width: icon.size ? icon.size + 18 : 35, height: icon.size ? icon.size + 18 : 35 },
      ]}
    >
      <DefaultIcons.Custom
        size={icon.size || 25}
        color={icon.color || Pallete.fonts.light}
        {...(icon as CustomIconProps)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: Pallete.primary,
    borderRadius: 100,
    padding: 3,
    marginRight: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
