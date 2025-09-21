import { View } from 'react-native';
import FancyTimePickerModal from '../../../time_picker/FancyTimePickerModal';
import FancyDatePickerModal from '../../../datepicker/FancyDataPickerModal';
import FancySettingItem from '../../../FancySettingItem';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventos';
import { format } from 'date-fns';

export default function EventoDatesInput({ disabled = false }: { disabled?: boolean }) {
  const {
    control,
    formState: { errors },
    getValues,
  } = useFormContext<EventoFormData>();

  return (
    <View style={{ gap: 15 }}>
      <View style={{ gap: 5 }}>
        <FancySettingItem
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-left', size: 20 }}
          label="Começa"
          options={[]}
          rightComponent={<DateInput control={control} name={'dataInicio'} disabled={disabled} />}
          disabled={disabled}
        />
        {/* {errors.dataInicio && <FancyErrorText message={errors.dataInicio?.message!} />} */}
      </View>
      <View style={{ gap: 5 }}>
        <FancySettingItem
          label="Termina"
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-right', size: 20 }}
          options={[]}
          rightComponent={<DateInput control={control} name={'dataTermino'} disabled={disabled} />}
          disabled={disabled}
        />
        {/* {errors.dataTermino && <FancyErrorText message={errors.dataTermino?.message!} />} */}
      </View>
    </View>
  );
}

function DateInput({ control, disabled, name }: { control: any; disabled?: boolean; name: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, formState: { errors } }) => {
        if (!value) {
          return <></>;
        }

        return (
          <View>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <FancyDatePickerModal
                disabled={disabled}
                value={value}
                onChange={date => {
                  const day = format(date, 'dd');
                  const month = format(date, 'MM');
                  const year = format(date, 'yyyy');
                  const hour = format(value, 'HH');
                  const minutes = format(value, 'mm');
                  const newDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    Number(hour),
                    Number(minutes)
                  );
                  onChange(newDate);
                }}
                containerStyle={{ width: 100 }}
              />
              <FancyTimePickerModal
                disabled={disabled}
                value={{ hour: Number(format(value, 'HH')), minute: Number(format(value, 'mm')) }}
                onChange={time => {
                  const day = format(value, 'dd');
                  const month = format(value, 'MM');
                  const year = format(value, 'yyyy');
                  const newDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    time.hour,
                    time.minute
                  );
                  onChange(newDate);
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
