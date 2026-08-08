import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Insets,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useMemo } from 'react';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { getFancyButtonParameters } from './FancyButtonStyles';
import { usePallete } from '../../hooks/usePallete';

type FancyButtonSize = number | { w: number; h: number };

export type FancyButtonProps = {
  label?: string;
  labelProps?: FancyTextProps;
  onPress?: (event: GestureResponderEvent) => void;
  icon?: CustomIconProps;
  iconPosition?: 'left' | 'right';
  type?: 'contained' | 'outlined' | 'text' | 'light';
  disabled?: boolean;
  mode?: 'default' | 'icon';
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;
  textProps?: FancyTextProps;
  size?: FancyButtonSize;
  hitSlop?: Insets;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  // Novas props para loading padronizado
  isLoading?: boolean;
  loadingText?: string;
  spinnerSize?: 'small' | 'large';
  disableOnLoading?: boolean;
  leftIconWhileLoading?: boolean;
  loadingColor?: string;
};

const resolveSize = (size?: FancyButtonSize, fallback = 40) => {
  if (!size) return fallback;
  return typeof size === 'number' ? size : size.h;
};

const resolveMinWidth = (size?: FancyButtonSize, fallback = 45) => {
  if (!size) return fallback;
  return typeof size === 'number' ? size : size.w;
};

export default function FancyButton({
  type = 'contained',
  disabled = false,
  mode = 'default',
  iconPosition = 'left',
  textProps,
  isLoading = false,
  loadingText,
  spinnerSize = 'small',
  disableOnLoading = true,
  leftIconWhileLoading = true,
  loadingColor,
  ...props
}: FancyButtonProps) {
  const palette = usePallete();
  const { containedParameters, outlinedParameters, textParameters, lightParameters } = useMemo(
    () => getFancyButtonParameters(palette),
    [palette],
  );
  const height = resolveSize(props.size);
  const minWidth = resolveMinWidth(props.size);

  const parameters =
    type === 'contained'
      ? containedParameters
      : type === 'outlined'
        ? outlinedParameters
        : type === 'text'
          ? textParameters
          : lightParameters;

  const {
    style: labelPropsStyle,
    size: providedLabelSize,
    numberOfLines: providedNumberOfLines,
    adjustsFontSizeToFit: providedAdjustsFontSizeToFit,
    minimumFontScale: providedMinimumFontScale,
    ...restLabelProps
  } = props.labelProps ?? {};

  const numberOfLines = providedNumberOfLines ?? 1;
  const adjustsFontSizeToFit = providedAdjustsFontSizeToFit ?? true;
  const minimumFontScale = providedMinimumFontScale ?? 0.85;

  const dimensionStyle = mode === 'icon' ? { width: minWidth, height } : { minWidth, height };
  const accessibilityState = { disabled, ...props.accessibilityState };

  const showLoading = !!isLoading;
  const isBtnDisabled = disabled || (showLoading && disableOnLoading);

  // Adiciona paddingHorizontal apenas se houver label (texto)
  const hasLabel = !!(props.label || loadingText);
  const loadingLabel = loadingText || props.label;
  const paddingStyle = hasLabel && mode === 'default' ? { paddingHorizontal: 12 } : {};

  // Novo padrão: spinner SEMPRE à esquerda do texto quando loading
  return (
    <TouchableOpacity
      hitSlop={props.hitSlop ?? { bottom: 4, top: 4, left: 4, right: 4 }}
      disabled={isBtnDisabled}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityHint={props.accessibilityHint}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={{
        ...accessibilityState,
        busy: showLoading || undefined,
        disabled: isBtnDisabled,
      }}
      style={[
        baseStyles.container,
        iconPosition === 'left' ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' },
        mode === 'icon' && baseStyles.mode_icon,
        isBtnDisabled ? parameters.disabledContainerStyle : parameters.containerStyle,
        dimensionStyle,
        paddingStyle,
        props.containerStyle,
        showLoading && { opacity: 0.7 },
      ]}
      activeOpacity={isBtnDisabled ? 1 : 0.7}
      onPress={!isBtnDisabled ? props.onPress : undefined}
    >
      {/* IMPORTANTE: NUNCA trocar o tipo de elemento no mesmo índice entre os
          estados loading/normal — isso faz o Android crashar com "addViewAt:
          failed to insert view into parent at index" quando a re-renderização
          coincide com churn de árvore (ex.: toast + router.back() ao salvar).
          Por isso o ícone e o spinner ficam SEMPRE montados juntos no mesmo
          slot, e só a opacity alterna. */}
      {(props.icon || showLoading) && (
        <View style={baseStyles.leadingSlot}>
          {props.icon
            ? DefaultIcons.Custom({
                ...props.icon,
                size: props.icon.size || height - 8,
                style: [
                  {
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  },
                  isBtnDisabled ? parameters.disabledIconStyle : parameters.iconStyle,
                  props.iconStyle,
                  ...(props.icon.color !== undefined ? [{ color: props.icon.color }] : []),
                  props.icon.style,
                  showLoading && { opacity: 0 },
                ],
              })
            : null}
          <ActivityIndicator
            size={spinnerSize}
            color={loadingColor || (isBtnDisabled ? palette.icons.dark : palette.primary)}
            style={[
              props.icon ? baseStyles.spinnerOverlay : undefined,
              { opacity: showLoading ? 1 : 0 },
            ]}
          />
        </View>
      )}
      {((props.label && mode === 'default') || (showLoading && loadingLabel)) && (
        <FancyText
          {...restLabelProps}
          type={restLabelProps.type ?? 'semiBold'}
          size={props.labelProps?.size ?? 'small'}
          numberOfLines={numberOfLines}
          minimumFontScale={minimumFontScale}
          style={[
            { textAlign: 'center' },
            showLoading && loadingColor
              ? { color: loadingColor }
              : isBtnDisabled
                ? parameters.disabledTextStyle
                : parameters.textStyle,
            props.labelStyle,
            labelPropsStyle,
          ]}
          {...textProps}
        >
          {showLoading ? loadingLabel : props.label}
        </FancyText>
      )}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mode_icon: { paddingHorizontal: 0 },
  leadingSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
