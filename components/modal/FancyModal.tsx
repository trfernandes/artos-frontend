import { useEffect, useId } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ModalProps,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { usePallete } from '../../hooks/usePallete';
import { ModalStack } from './GlobalModalHost';

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
  const stackId = useId();
  const visible = modalProps?.visible ?? false;

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

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.centeredView,
          { backgroundColor: palette.overlays.backdrop },
          modalProps?.style,
        ]}
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
  );

  useEffect(() => {
    if (visible) {
      ModalStack.push(stackId, content, () => modalProps?.onRequestClose?.({} as any));
    } else {
      ModalStack.pop(stackId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) ModalStack.update(stackId, content, () => modalProps?.onRequestClose?.({} as any));
  });

  useEffect(() => () => ModalStack.pop(stackId), [stackId]);

  return null;
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
    // permite o ScrollView encolher dentro do maxHeight do modal e rolar,
    // em vez de estourar e cortar o último campo/conteúdo na base
    flexShrink: 1,
  },
  centerContent: {
    flexGrow: 1,
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
  },
});
