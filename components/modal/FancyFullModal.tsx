import { View, Modal, StyleSheet, ModalProps, NativeSyntheticEvent } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyPageHeader from '../header/FancyHeader';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTopSafeInset } from '../../hooks/useTopSafeInset';
import { usePallete } from '../../hooks/usePallete';

export type FancyFullModalProps = { title?: string; modalProps?: ModalProps; children?: React.ReactNode };

export default function FancyFullModal({ title, modalProps, children }: FancyFullModalProps) {
  const insets = useSafeAreaInsets();
  const topInset = useTopSafeInset();
  const palette = usePallete();

  return (
    <Modal visible={modalProps?.visible} {...modalProps}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MenuProvider skipInstanceCheck={true}>
          <View
            style={{
              paddingTop: topInset,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              backgroundColor: palette.backgroundColor,
              flex: 1,
            }}
          >
            <View style={styles.container}>
              <View style={styles.inner}>
                <FancyPageHeader
                  leftButton='back'
                  applyTopSafeArea={false}
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
