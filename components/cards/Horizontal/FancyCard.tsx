import FancyCardSimple, { FancyCardSimpleProps } from './FancyCardSimple';
import FancyCardCheckBox, { FancyCardCheckboxProps } from './FancyCardCheckBox';
import { ComponentType, ReactNode } from 'react';
import { View } from 'react-native';
import FancyCardIcon, { FancyCardIconProps } from './FancyCardIcon';
import FancyCardImage, { FancyCardImageProps } from './FancyCardImage';
import FancyCardLetter, { FancyCardLetterProps } from './FancyCardLetter';
import FancyCardColor, { FancyCardColorProps } from './FancyCardColor';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { ActionButtonProps } from './FancyCardActionButtons';

export type CardType = 'card' | 'checkbox' | 'color' | 'icon' | 'image' | 'letter' | 'simple';

export function FancyCard({ children }: { children: ReactNode }) {
  return <View>{children}</View>;
}

FancyCard.CheckBox = function (props: FancyCardCheckboxProps) {
  return <FancyCardCheckBox {...props} />;
};

FancyCard.Color = function (props: FancyCardColorProps) {
  return <FancyCardColor {...props} />;
};

export type FancyCardImageBaseProps = {
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
  | 'titleProps'
  | 'subtitleProps'
  | 'isCollapsable'
  | 'centerContainerStyle'
  | 'backgroundColor'
  | 'onPress'
  | 'onLongPress'
  | 'delayLongPress'
  | 'accessibilityRole'
  | 'accessibilityLabel'
>;

export type ImageType = { type: 'image'; props: FancyCardImageProps };
export type IconType = { type: 'icon'; props: FancyCardIconProps };
export type LetterType = { type: 'letter'; props: FancyCardLetterProps };

FancyCard.Image = function (props: ImageType | IconType | LetterType) {
  switch (props.type) {
    case 'image':
      return <FancyCardImage {...(props.props as FancyCardImageProps)} />;
    case 'icon':
      return <FancyCardIcon {...(props.props as FancyCardIconProps)} />;
    case 'letter':
      return <FancyCardLetter {...(props.props as FancyCardLetterProps)} />;
    default:
      break;
  }
};

// FancyCard.Icon = function (props: FancyCardIconProps) {
//   return <FancyCardIcon {...props} />;
// };

// FancyCard.Image = function (props: FancyCardImageProps) {
//   return <FancyCardImage {...props} />;
// };

// FancyCard.Letter = function (props: FancyCardLetterProps) {
//   return <FancyCardLetter {...props} />;
// };

FancyCard.Simple = function (props: FancyCardSimpleProps) {
  return <FancyCardSimple {...props} />;
};

export function getFancyCardComponent(type: CardType): ComponentType<any> {
  switch (type) {
    case 'card':
      return FancyBaseCard;
    case 'checkbox':
      return FancyCardCheckBox;
    case 'color':
      return FancyCardColor;
    case 'icon':
      return FancyCardIcon;
    case 'image':
      return FancyCardImage;
    case 'letter':
      return FancyCardLetter;
    case 'simple':
      return FancyCardSimple;
    default:
      throw new Error('Tipo de card inválido');
  }
}
