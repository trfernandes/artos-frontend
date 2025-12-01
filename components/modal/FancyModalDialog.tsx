import { ModalProps, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import FancyModal, { FancyModalProps } from './FancyModal';
import FancyButton, { FancyButtonProps } from '../buttons/FancyButton';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { Pallete } from '../../constants/colors';

export type FancyModalDialogProps<T> = {
  title?: string;
  children?: React.ReactNode;
  onButton1Press?: () => void;
  OnButton2Press?: (data: T | undefined) => void;
  buttonContainerComponenet?: React.ReactNode;
  button1?: FancyButtonProps & { visible?: boolean };
  button2?: FancyButtonProps & { visible?: boolean };
  buttonContainerStyle?: StyleProp<ViewStyle>;
  centerContainerStyle?: StyleProp<ViewStyle>;
  modalProps?: Omit<ModalProps, 'onRequestClose'>;
  showCloseButton?: boolean;
  closeButtonIconProps?: CustomIconProps;
  closeButtonAccessibilityLabel?: string;
} & Omit<FancyModalProps, 'top' | 'bottom' | 'center' | 'modalProps'>;

export default function FancyModalDialog<T = void>({
  title,
  children,
  onButton1Press,
  OnButton2Press,
  buttonContainerComponenet: buttonContainerComponent,
  button1 = { visible: true },
  button2 = { visible: true },
  buttonContainerStyle,
  centerContainerStyle,
  modalProps,
  showCloseButton,
  closeButtonIconProps,
  closeButtonAccessibilityLabel,
  containerStyle,
  ...fancyModalProps
}: FancyModalDialogProps<T>) {
  const shouldRenderCloseButton = Boolean(showCloseButton && onButton1Press);

  const closeIconProps: CustomIconProps = {
    library: closeButtonIconProps?.library ?? 'Ionicons',
    name: closeButtonIconProps?.name ?? 'close-circle-outline',
    size: closeButtonIconProps?.size ?? 24,
    color: closeButtonIconProps?.color ?? Pallete.fonts.dark,
    style: closeButtonIconProps?.style,
  };

  const mergedModalProps = onButton1Press
    ? ({ ...(modalProps ?? {}), onRequestClose: onButton1Press } as ModalProps)
    : (modalProps as ModalProps | undefined);

  const shouldShowButton1 = button1?.visible !== false;
  const shouldShowButton2 = button2?.visible !== false;

  return (
    <FancyModal
      {...fancyModalProps}
      top={
        title && (
          <View style={styles.titleContainer}>
            <FancyText size="medium" type="bold" style={styles.titleText}>
              {title}
            </FancyText>
            {shouldRenderCloseButton && (
              <TouchableOpacity
                onPress={onButton1Press}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={closeButtonAccessibilityLabel ?? 'Fechar'}
              >
                {DefaultIcons.Custom(closeIconProps)}
              </TouchableOpacity>
            )}
          </View>
        )
      }
      center={<View style={[styles.contentContainer, centerContainerStyle]}>{children}</View>}
      bottom={
        buttonContainerComponent || (
          <View style={[styles.buttonsContainer, buttonContainerStyle]}>
            {shouldShowButton1 && (
              <FancyButton
                label={button1.label ?? 'Cancelar'}
                type="outlined"
                onPress={onButton1Press}
                disabled={false}
                {...button1}
                containerStyle={[button1?.containerStyle, styles.button]}
              />
            )}
            {shouldShowButton2 && (
              <FancyButton
                label={button2.label ?? 'Confirmar'}
                onPress={() => OnButton2Press?.(undefined as T)}
                disabled={false}
                {...button2}
                containerStyle={[button2?.containerStyle, styles.button]}
              />
            )}
          </View>
        )
      }
      containerStyle={[styles.container, containerStyle]}
      modalProps={mergedModalProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
  },
  titleText: {
    lineHeight: 16,
    textAlign: 'center',
    flexShrink: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    // padding: 6,
  },
  contentContainer: { width: '100%' },
  buttonsContainer: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, height: 36 },
});
