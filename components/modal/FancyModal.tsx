import { Modal, ModalProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type FancyModalProps = {
  modalProps?: ModalProps;
  top?: React.ReactNode;
  center?: React.ReactNode;
  bottom?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancyModal({ modalProps, center, top, bottom, ...props }: FancyModalProps) {
  return (
    <Modal animationType='fade' presentationStyle='formSheet' transparent {...modalProps}>
      <View style={[styles.centeredView, modalProps?.style]}>
        <View style={[styles.modalView, props.containerStyle]}>
          {top}
          {center}
          {bottom}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
});
