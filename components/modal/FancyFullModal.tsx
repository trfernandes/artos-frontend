import { View, Modal, StyleSheet, ModalProps, Platform, NativeSyntheticEvent } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyPageHeader from '../header/FancyHeader';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type FancyFullModalProps = { title?: string; modalProps?: ModalProps; children?: React.ReactNode };

export default function FancyFullModal({ title, modalProps, children }: FancyFullModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={modalProps?.visible} {...modalProps}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MenuProvider skipInstanceCheck={true}>
          <View
            style={{
              paddingTop: Platform.OS === 'ios' ? insets.top - 3 : 30,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              flex: 1,
            }}
          >
            <View style={styles.container}>
              <View style={styles.inner}>
                <FancyPageHeader
                  leftButton='back'
                  options={{ title }}
                  leftButtonOnPress={() => modalProps?.onRequestClose?.({} as unknown as NativeSyntheticEvent<any>)}
                />
              </View>
              {children}
            </View>
          </View>
        </MenuProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 5 },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
