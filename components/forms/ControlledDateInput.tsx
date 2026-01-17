import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyTextInput, { FancyTextInputProps } from '../fields/FancyTextInput';
import { TextInputProps, View } from 'react-native';
import FancyErrorText from './FancyErrorText';
import { useState } from 'react';
import FancyModalDialog from '../modal/FancyModalDialog';
import FancyDatePicker from '../datepicker/FancyDatePicker';
import DefaultIcons from '../FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';
import { Pallete } from '../../constants/colors';
import { FancyCalendarProps } from '../calendar/FancyCalendar';

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
  const [showModal, setShowModal] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyTextInput
            onPress={() => setShowModal(true)}
            disabled={disabled}
            {...rest}
            value={value ? new Date(value).toLocaleDateString() : ''}
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
                <DefaultIcons.Custom {...DefaultIconsNames['calendar-month']} color={Pallete.icons.inactive} size={20} />
              </View>
            }
          />
          {showErrorMessage && error && <FancyErrorText message={error.message!} />}
          {showModal && (
            <FancyModalDialog
              containerStyle={{ gap: 20 }}
              modalProps={{ visible: showModal }}
              onButton1Press={() => setShowModal(false)}
              onButton2Press={() => {
                onChange?.(value);
                setShowModal(false);
              }}
            >
              <FancyDatePicker
                calendarProps={{
                  ...(calendarProps ?? {}),
                  value,
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
      )}
    />
  );
}
