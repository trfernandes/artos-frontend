import { useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import FancyDataPanel, { FancyDataPanelProps } from '../FancyDataPanel';
import DateUtils from '../../utils/date_utils';
import ModernDatePickerSheet, { ModernDatePickerSheetProps } from './ModernDatePickerSheet';

export type ModernDatePickerFieldProps = {
  value?: Date;
  onChange?: (date: Date) => void;
  disabled?: boolean;
  readonly?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  panelProps?: FancyDataPanelProps;
  sheetProps?: Partial<Omit<ModernDatePickerSheetProps, 'visible' | 'value' | 'onClose' | 'onConfirm'>>;
};

export default function ModernDatePickerField({
  value,
  onChange,
  disabled = false,
  readonly = false,
  containerStyle,
  panelProps,
  sheetProps,
}: ModernDatePickerFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={containerStyle}>
      <FancyDataPanel
        disabled={disabled}
        value={value ? DateUtils.formatToBrDate(value) : undefined}
        onPress={() => {
          if (!disabled && !readonly) setVisible(true);
        }}
        {...panelProps}
      />

      <ModernDatePickerSheet
        visible={visible}
        value={value}
        onClose={() => setVisible(false)}
        onConfirm={(date) => {
          onChange?.(date);
          setVisible(false);
        }}
        {...sheetProps}
      />
    </View>
  );
}
