import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useEffect, useState } from 'react';
import FancyDataPanel, { FancyDataPanelProps } from '../FancyDataPanel';
import DateUtils from '../../utils/date_utils';
import FancyDatePicker from './FancyDatePicker';
import FancyModalDialog from '../modal/FancyModalDialog';

export type FancyDatePickerModalProps = {
  value?: Date;
  onChange?: (date: Date) => void;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  readonly?: boolean;
  panelProps?: FancyDataPanelProps;
};

export default function FancyDatePickerModal({
  value,
  onChange,
  containerStyle,
  disabled = false,
  readonly = false,
  panelProps,
}: FancyDatePickerModalProps) {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(value || new Date());

  // ✅ garante que o estado interno acompanha props.value
  useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  return (
    <View style={[containerStyle]}>
      <FancyDataPanel
        disabled={disabled}
        onPress={() => !readonly && setVisible(true)}
        value={value && DateUtils.formatToBrDate(value)}
        {...panelProps}
      />
      {!disabled && visible && (
        <FancyModalDialog
          containerStyle={{ gap: 20 }}
          modalProps={{ visible }}
          onClose={() => setVisible(false)}
          onConfirm={() => {
            onChange?.(date);
            setVisible(false);
          }}
        >
          <FancyDatePicker
            calendarProps={{
              value: date,
              onChangeSelectedDate: d => setDate(d),
            }}
          />
        </FancyModalDialog>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
