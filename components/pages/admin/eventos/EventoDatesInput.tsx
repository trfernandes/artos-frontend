import { View } from 'react-native';
import FancyTimePickerModal from '../../../time_picker/FancyTimePickerModal';
import FancyDatePickerModal from '../../../datepicker/FancyDataPickerModal';
import FancySettingItem from '../../../FancySettingItem';
import { Control, Controller, Path, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventosCrud';
import { addHours, format } from 'date-fns';
import FancyErrorText from '../../../forms/FancyErrorText';

export default function EventoDatesInput({ disabled = false }: { disabled?: boolean }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  return (
    <View style={{ gap: 15 }}>
      <View style={{ gap: 5 }}>
        <FancySettingItem
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-left', size: 20 }}
          label="Começa"
          options={[]}
          rightComponent={
            <DateInput
              control={control}
              name={'dataInicio'}
              disabled={disabled}
              onChange={date => {
                const newDate = addHours(date, 1);
                console.log('Start date changed, updating end date to:', newDate);
                setValue('dataTermino', newDate, { shouldDirty: true, shouldValidate: true });
              }}
            />
          }
          disabled={disabled}
        />
        <FancyErrorText message={errors.dataInicio?.message!} />
      </View>
      <View style={{ gap: 5 }}>
        <FancySettingItem
          label="Termina"
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-right', size: 20 }}
          options={[]}
          rightComponent={<DateInput control={control} name={'dataTermino'} disabled={disabled} />}
          disabled={disabled}
        />
        <FancyErrorText message={errors.dataTermino?.message!} />
      </View>
    </View>
  );
}

function DateInput({
  control,
  disabled,
  name,
  onChange,
}: {
  control: Control<EventoFormData>;
  disabled?: boolean;
  name: Path<EventoFormData>;
  onChange?: (date: Date) => void;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange: fieldOnChange, value }, formState: { errors } }) => {
        if (!value) {
          return <></>;
        }

        return (
          <View>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <FancyDatePickerModal
                disabled={disabled}
                value={value as Date}
                onChange={date => {
                  const day = format(date, 'dd');
                  const month = format(date, 'MM');
                  const year = format(date, 'yyyy');
                  const hour = format(value as Date, 'HH');
                  const minutes = format(value as Date, 'mm');
                  const newDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minutes));
                  if (date.getTime() !== newDate.getTime()) {
                    fieldOnChange(newDate);
                    onChange?.(newDate);
                  }
                }}
                containerStyle={{ width: 100 }}
              />

              <FancyTimePickerModal
                disabled={disabled}
                value={{ hour: Number(format(value as Date, 'HH')), minute: Number(format(value as Date, 'mm')) }}
                onChange={time => {
                  const y = (value as Date).getFullYear();
                  const m = (value as Date).getMonth();
                  const d = (value as Date).getDate();
                  const newDate = new Date(y, m, d, time.hour, time.minute);

                  if ((value as Date)?.getTime() !== newDate.getTime()) {
                    fieldOnChange(newDate); // atualiza o campo controlado
                    onChange?.(newDate); // callback externo (atualiza dataTermino quando for dataInicio)
                  }
                }}
                containerStyle={{ width: 100 }}
              />
            </View>
          </View>
        );
      }}
    />
  );
}
