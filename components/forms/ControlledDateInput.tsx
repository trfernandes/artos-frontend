import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyTextInput, { FancyTextInputProps } from '../fields/FancyTextInput';
import { Platform, TextInputProps, View } from 'react-native';
import FancyErrorText from './FancyErrorText';
import { useState } from 'react';
import FancyModalDialog from '../modal/FancyModalDialog';
import FancyDatePicker from '../datepicker/FancyDatePicker';
import DefaultIcons from '../FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';
import { FancyCalendarProps } from '../calendar/FancyCalendar';
import { usePallete } from '../../hooks/usePallete';

interface ControlledDateInputProps<FormData extends FieldValues>
  extends
    Pick<FancyTextInputProps, 'label' | 'inputContainerStyle' | 'inputProps' | 'disabled'>,
    Pick<TextInputProps, 'keyboardType'> {
  control: Control<FormData>;
  name: Path<FormData>;
  showErrorMessage?: boolean;
  calendarProps?: FancyCalendarProps;
}

export default function ControlledDateInput<FormData extends FieldValues>({
  control,
  name,
  showErrorMessage = true,
  calendarProps,
  ...rest
}: ControlledDateInputProps<FormData>) {
  const palette = usePallete();
  const [showModal, setShowModal] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => {
        const selectedDate = (() => {
          if (!value) return undefined;
          const rawValue = value as any;
          const date = Object.prototype.toString.call(rawValue) === '[object Date]' ? rawValue as Date : new Date(rawValue);
          return Number.isNaN(date.getTime()) ? undefined : date;
        })();

        const isDisabled = disabled || rest.disabled;

        return (
        <View style={{ gap: 5 }}>
          <FancyTextInput
            {...rest}
            onPress={() => {
              if (!isDisabled) setShowModal(true);
            }}
            disabled={isDisabled}
            value={selectedDate ? selectedDate.toLocaleDateString() : ''}
            inputProps={{
              ...rest.inputProps,
              onBlur,
              onChangeText: (text) => {
                text;
                onChange(text);
              },
              editable: false,
            }}
            rightContainer={
              <View style={{ paddingRight: 10 }}>
                <DefaultIcons.Custom {...DefaultIconsNames['calendar-month']} color={palette.icons.inactive} size={20} />
              </View>
            }
          />
          {showErrorMessage && error && <FancyErrorText message={error.message!} />}
          {!isDisabled && showModal && (
            <FancyModalDialog
              containerStyle={{ gap: Platform.OS === 'ios' ? 12 : 24 }}
              buttonContainerStyle={{ marginTop: Platform.OS === 'ios' ? 0 : 8 }}
              modalProps={{ visible: showModal }}
              onButton1Press={() => setShowModal(false)}
              onButton2Press={() => {
                onChange?.(value);
                setShowModal(false);
              }}
            >
              <FancyDatePicker
                calendarProps={{
                  ...calendarProps,
                  containerStyle: [{ backgroundColor: 'transparent', borderWidth: 0 }, calendarProps?.containerStyle],
                  dayModeTopPadding: calendarProps?.dayModeTopPadding ?? 10,
                  value: selectedDate,
                  onChangeSelectedDate: onChange,
                  dayViewProps: {
                    ...(calendarProps?.dayViewProps ?? {}),
                    markedDatesType: 'SurroundCircle',
                  },
                }}
              />
            </FancyModalDialog>
          )}
        </View>
        );
      }}
    />
  );
}
