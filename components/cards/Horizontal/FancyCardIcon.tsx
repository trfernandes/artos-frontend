import { StyleSheet, View } from 'react-native';
import FancyBaseCard from './FancyBaseCard';
import { isValidElement } from 'react';
import { FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { FancyCardImageBaseProps } from './FancyCard';

export type FancyCardIconProps = {
  cardIcon?: CustomIconProps & { backgroundColor?: string };
} & Pick<
  FancyCardImageBaseProps,
  | 'actionButtons'
  | 'title'
  | 'subtitle'
  | 'additionalData1'
  | 'additionalData2'
  | 'content'
  | 'containerStyle'
  | 'contentContainerStyle'
  | 'isCollapsable'
  | 'centerContainerStyle'
    | 'backgroundColor'
>;

export default function FancyCardIcon(props: FancyCardIconProps) {
  return (
    <FancyBaseCard
      {...props}
      containerStyle={[props.containerStyle, { paddingVertical: 10 }]}
      leftItem={props.cardIcon ? <CardIcon {...props.cardIcon} /> : undefined}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

function CardIcon(icon: CustomIconProps & { backgroundColor?: string }) {
  return (
    <View
      style={[
        styles.iconContainer,
        {
          backgroundColor: icon.backgroundColor || Pallete.primary,
          width: icon.size ? icon.size + 15 : 35,
          height: icon.size ? icon.size + 15 : 35,
        },
      ]}
    >
      <DefaultIcons.Custom size={icon.size || 25} color={icon.color || Pallete.fonts.light} {...(icon as CustomIconProps)} />
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
