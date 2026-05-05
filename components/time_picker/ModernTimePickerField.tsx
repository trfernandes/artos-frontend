import { useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import FancyDataPanel, { FancyDataPanelProps } from '../FancyDataPanel';
import DateUtils from '../../utils/date_utils';
import ModernTimePickerSheet, { ModernTimePickerSheetProps } from './ModernTimePickerSheet';

export type ModernTimePickerFieldProps = {
  value?: { hour: number; minute: number };
  onChange?: (time: { hour: number; minute: number }) => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  panelProps?: FancyDataPanelProps;
  sheetProps?: Partial<Omit<ModernTimePickerSheetProps, 'visible' | 'value' | 'onClose' | 'onConfirm'>>;
};

export default function ModernTimePickerField({
  value,
  onChange,
  disabled = false,
  containerStyle,
  panelProps,
  sheetProps,
}: ModernTimePickerFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={containerStyle}>
      <FancyDataPanel
        disabled={disabled}
        value={value ? DateUtils.formatHour(value.hour, value.minute) : undefined}
        onPress={() => {
          if (!disabled) setVisible(true);
        }}
        {...panelProps}
      />

      <ModernTimePickerSheet
        visible={visible}
        value={value}
        onClose={() => setVisible(false)}
        onConfirm={(time) => {
          onChange?.(time);
          setVisible(false);
        }}
        {...sheetProps}
      />
    </View>
  );
}
