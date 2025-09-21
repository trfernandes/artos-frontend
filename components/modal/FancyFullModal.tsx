import { View, Modal, StyleSheet, ModalProps, NativeSyntheticEvent, Platform } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DefaultIconsNames } from '../../constants/icons';
import FancyHeaderButton from '../header/FancyHeaderButton';

export type FancyFullModalProps = { modalProps?: ModalProps; children?: React.ReactNode };

export default function FancyFullModal({ modalProps, children }: FancyFullModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={modalProps?.visible} {...modalProps}>
      <MenuProvider skipInstanceCheck={true}>
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? insets.top - 3 : 0,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flex: 1,
          }}
        >
          <View style={styles.container}>
            <View style={styles.inner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FancyHeaderButton
                  icon={{ ...DefaultIconsNames['chevron-left'], size: 22 }}
                  onPress={() => modalProps?.onRequestClose?.({} as unknown as NativeSyntheticEvent<any>)}
                />
                <FancyText
                  type="semiBold"
                  size={'medium'}
                  style={{
                    color: Pallete.fonts.dark,
                    lineHeight: 16,
                    marginTop: 1,
                  }}
                >
                  Voltar
                </FancyText>
              </View>
            </View>
            {children}
          </View>
        </View>
      </MenuProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    width: '100%',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
