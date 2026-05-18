import { Keyboard, KeyboardAvoidingView, Modal, ModalProps, Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { usePallete } from '../../hooks/usePallete';

export type FancyModalProps = {
  modalProps?: ModalProps;
  top?: React.ReactNode;
  center?: React.ReactNode;
  bottom?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  closeOnBackdropPress?: boolean;
  dismissKeyboardOnBackdropPress?: boolean;
  avoidKeyboard?: boolean;
};

export default function FancyModal({
  modalProps,
  center,
  top,
  bottom,
  closeOnBackdropPress = false,
  dismissKeyboardOnBackdropPress = true,
  avoidKeyboard = false,
  ...props
}: FancyModalProps) {
  const palette = usePallete();

  const modalContent = (
    <View
      style={[
        styles.modalView,
        { backgroundColor: palette.backgroundColor, ...palette.shadows[200] },
        props.containerStyle,
      ]}
    >
      {top}
      {center && (
        <ScrollView
          style={styles.centerScroll}
          contentContainerStyle={styles.centerContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          bounces={false}
        >
          {center}
        </ScrollView>
      )}
      {bottom}
    </View>
  );

  return (
    <Modal animationType='fade' presentationStyle='overFullScreen' transparent {...modalProps}>
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
            {avoidKeyboard ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
              >
                {modalContent}
              </KeyboardAvoidingView>
            ) : (
              modalContent
            )}
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
    maxHeight: '88%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  centerScroll: {
    width: '100%',
  },
  centerContent: {
    flexGrow: 1,
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
  },
});
