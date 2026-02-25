import { Keyboard, Modal, ModalProps, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePallete } from '../../hooks/usePallete';

export type FancyModalProps = {
  modalProps?: ModalProps;
  top?: React.ReactNode;
  center?: React.ReactNode;
  bottom?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  closeOnBackdropPress?: boolean;
  dismissKeyboardOnBackdropPress?: boolean;
};

export default function FancyModal({
  modalProps,
  center,
  top,
  bottom,
  closeOnBackdropPress = false,
  dismissKeyboardOnBackdropPress = true,
  ...props
}: FancyModalProps) {
  const palette = usePallete();

  return (
    <Modal animationType='fade' presentationStyle='formSheet' transparent {...modalProps}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
            style={[styles.centeredView, { backgroundColor: palette.overlays.backdrop }, modalProps?.style]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                if (dismissKeyboardOnBackdropPress) {
                  Keyboard.dismiss();
                }

                if (closeOnBackdropPress) {
                  modalProps?.onRequestClose?.({} as any);
                }
              }}
            />
            <View
              style={[
                styles.modalView,
                { backgroundColor: palette.backgroundColor, ...palette.shadows[200] },
                props.containerStyle,
              ]}
            >
              {top}
              {center}
              {bottom}
            </View>
          </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
});
