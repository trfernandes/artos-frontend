import { ModalProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import FancyModal, { FancyModalProps } from './FancyModal';
import FancyButton, { FancyButtonProps } from '../buttons/FancyButton';

export type FancyModalDialogProps = {
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  buttonContainerComponenet?: React.ReactNode;
  button1?: FancyButtonProps;
  button2?: FancyButtonProps;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  centerContainerStyle?: StyleProp<ViewStyle>;
  modalProps?: Omit<ModalProps, 'onRequestClose'>;
} & Omit<FancyModalProps, 'top' | 'bottom' | 'center' | 'modalProps'>;

export default function FancyModalDialog(props: FancyModalDialogProps) {
  return (
    <FancyModal
      top={
        props.title && (
          <View style={styles.titleContainer}>
            {/* <FancyButton
              icon={{ ...DefaultIconsNames['calendar-day'], size: 14, color: Pallete.fonts.dark }}
              size={30}
              containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
            /> */}
            <FancyText size="medium" type="bold">
              {props.title}
            </FancyText>
          </View>
        )
      }
      center={<View style={[styles.contentContainer, props.centerContainerStyle]}>{props.children}</View>}
      bottom={
        props.buttonContainerComponenet || (
          <View style={[styles.buttonsContainer, props.buttonContainerStyle]}>
            <FancyButton
              label="Cancelar"
              type="outlined"
              containerStyle={styles.button}
              onPress={props.onClose}
              {...props.button1}
            />
            <FancyButton label="Confirmar" containerStyle={styles.button} onPress={props.onConfirm} {...props.button2} />
          </View>
        )
      }
      containerStyle={styles.container}
      {...props}
      modalProps={{ onRequestClose: props.onClose }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  titleContainer: { width: '100%', alignItems: 'center', flexDirection: 'row', gap: 10 },
  contentContainer: { width: '100%' },
  buttonsContainer: { flexDirection: 'row', gap: 10 },
  button: { flex: 1 },
});
