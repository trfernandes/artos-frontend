import { StyleSheet, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import FancyButton from '../buttons/FancyButton';

export type FancyListEmptyProps = {
  label?: string;
  labelColor?: string;
  labelSize?: 'extraSmall' | 'small' | 'medium' | 'large' | 'largeMedium' | 'extraLarge' | number;
  icon?: CustomIconProps;
  helperText?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionIcon?: CustomIconProps;
  muted?: boolean;
  variant?: 'default' | 'compact';
  hideIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  helperTextStyle?: StyleProp<TextStyle>;
};

export default function FancyListEmpty(props: FancyListEmptyProps) {
  const Pallete = usePallete();
  const showAction = Boolean(props.actionLabel && props.onActionPress);
  const isMuted = props.muted ?? !showAction;
  const isCompact = props.variant === 'compact';

  return (
    <View
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        isMuted && styles.containerMuted,
        props.containerStyle,
      ]}
    >
      {!props.hideIcon && (
        <DefaultIcons.Custom
          library={props.icon?.library || 'FontAwesome6'}
          name={props.icon?.name || 'robot'}
          size={props.icon?.size || (isCompact ? 20 : 55)}
          color={props.icon?.color || Pallete.fonts.inactive2}
        />
      )}
      <FancyText
        size={props.labelSize ?? (isCompact ? 'small' : 'large')}
        type={isCompact ? 'medium' : 'bold'}
        color={props.labelColor || Pallete.fonts.inactive2}
        style={isCompact ? styles.labelCompact : { paddingHorizontal: 15, textAlign: 'center' }}
      >
        {props.label || 'Não há nada por aqui...'}
      </FancyText>
      {props.helperText && (
        <FancyText
          size='small'
          color={Pallete.fonts.inactive}
          style={[styles.helperText, props.helperTextStyle]}
        >
          {props.helperText}
        </FancyText>
      )}
      {showAction && (
        <FancyButton
          label={props.actionLabel}
          onPress={props.onActionPress}
          icon={
            props.actionIcon || {
              library: 'MaterialCommunityIcons',
              name: 'ticket-confirmation-outline',
              size: 16,
            }
          }
          containerStyle={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  containerCompact: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  containerMuted: {
    opacity: 0.4,
  },
  labelCompact: {
    textAlign: 'left',
  },
  helperText: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 19,
    marginTop: -4,
  },
  actionButton: {
    marginTop: -2,
    paddingHorizontal: 14,
  },
});
