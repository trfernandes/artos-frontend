import { StyleSheet, View } from 'react-native';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { isValidElement } from 'react';
import { FancyActionButtons } from './FancyCardActionButtons';
import { ThemePalette } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { FancyCardImageBaseProps } from './FancyCard';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type FancyCardIconProps = {
  cardIcon?: CustomIconProps & { backgroundColor?: string };
  titleProps?: FancyBaseCardProps['titleProps'];
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
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <FancyBaseCard
      {...props}
      containerStyle={[props.containerStyle, { paddingVertical: 10 }]}
      leftItem={props.cardIcon ? <CardIcon icon={props.cardIcon} styles={styles} palette={palette} /> : undefined}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

function CardIcon({
  icon,
  styles,
  palette,
}: {
  icon: CustomIconProps & { backgroundColor?: string };
  styles: ReturnType<typeof createStyles>;
  palette: ThemePalette;
}) {
  return (
    <View
      style={[
        styles.iconContainer,
        {
          backgroundColor: icon.backgroundColor || palette.primary,
          width: icon.size ? icon.size + 15 : 35,
          height: icon.size ? icon.size + 15 : 35,
        },
      ]}
    >
      <DefaultIcons.Custom size={icon.size || 25} color={icon.color || palette.fonts.light} {...(icon as CustomIconProps)} />
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    iconContainer: {
      backgroundColor: palette.primary,
      borderRadius: 100,
      padding: 3,
      marginRight: 5,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
