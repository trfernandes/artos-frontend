import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyModalDialog, { FancyModalDialogProps } from '../modal/FancyModalDialog';
import FancyTimePicker, { FancyTimePickerProps } from './FancyTimePicker';
import { useState } from 'react';
import FancyDataPanel, { FancyDataPanelProps } from '../FancyDataPanel';
import DateUtils from '../../utils/data_utils';

export type FancyTimePickerModalProps = {
  value?: { hour: number; minute: number };
  onChange?: (time: { hour: number; minute: number }) => void;
  panelProps?: FancyDataPanelProps;
  modalProps?: FancyModalDialogProps;
  pickerProps?: FancyTimePickerProps;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function FancyTimePickerModal({
  disabled = false,
  value,
  onChange,
  containerStyle,
  panelProps,
  modalProps,
  pickerProps,
}: FancyTimePickerModalProps) {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState({ hour: value?.hour || 0, minute: value?.minute || 0 });

  return (
    <View style={containerStyle}>
      <FancyDataPanel
        disabled={disabled}
        onPress={() => setVisible(true)}
        value={DateUtils.formatHour(time.hour, time.minute)}
        {...panelProps}
      />
      {!disabled && visible && (
        <FancyModalDialog
          modalProps={{ visible }}
          onClose={() => setVisible(false)}
          title={'Selecionar Horário'}
          onConfirm={() => {
            onChange?.(time);
            setVisible(false);
          }}
          {...modalProps}
        >
          <FancyTimePicker
            value={value}
            containerStyle={styles.pickerContainer}
            onChange={time => {
              setTime(time);
              onChange?.(time);
            }}
            {...pickerProps}
          />
        </FancyModalDialog>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: { width: '100%' },
});
