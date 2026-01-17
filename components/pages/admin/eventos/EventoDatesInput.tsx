import { TouchableOpacity, View } from 'react-native';
import FancyTimePickerModal from '../../../time_picker/FancyTimePickerModal';
import FancyDatePickerModal from '../../../datepicker/FancyDataPickerModal';
import FancySettingItem from '../../../FancySettingItem';
import { Control, Controller, Path, useFormContext } from 'react-hook-form';
import { addHours, format } from 'date-fns';
import FancyErrorText from '../../../forms/FancyErrorText';
import { useEffect, useState } from 'react';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import { Pallete } from '../../../../constants/colors';
import FancyDataPanel from '../../../FancyDataPanel';
import DefaultIcons from '../../../FancyIcons';
import { RecorrenciaEnum } from '../../../../domain/enums/Evento/recorrencia.enum';

export default function EventoDatesInput({
  disabled = false,
  onClearEndDate,
}: {
  disabled?: boolean;
  onClearEndDate?: () => void;
}) {
  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const dataTerminoWatch = watch('dataTermino');

  const [endDateMode, setEndDateMode] = useState<'clear' | 'set'>();

  useEffect(() => {
    setEndDateMode(dataTerminoWatch ? 'set' : 'clear');
  }, [dataTerminoWatch]);

  return (
    <View style={{ gap: 15 }}>
      <View style={{ gap: 5 }}>
        <FancySettingItem
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'calendar-arrow-left',
            size: 20,
          }}
          label='Começa'
          options={[]}
          rightComponent={
            <View style={{ paddingLeft: 15, flex: 1 }}>
              <DateInput
                control={control}
                name={'dataInicio'}
                disabled={disabled}
                onChange={(date) => {
                  const newDate = addHours(date, 1);
                  setValue('dataTermino', newDate, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </View>
          }
          disabled={disabled}
        />
        <FancyErrorText message={errors.dataInicio?.message!} />
      </View>

      <View style={{ gap: 5, flexDirection: 'column', width: '100%' }}>
        <FancySettingItem
          label='Termina'
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'calendar-arrow-right',
            size: 20,
          }}
          rightComponent={
            <View
              style={{
                paddingLeft: 15,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              {endDateMode === 'clear' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 17,
                    justifyContent: 'space-between',
                  }}
                >
                  <FancyDataPanel value='Nunca' containerStyle={{}} />
                  <TouchableOpacity
                    onPress={() => {
                      setEndDateMode('set');

                      const newDate = addHours(getValues('dataInicio'), 1);
                      setValue('dataTermino', newDate, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      onClearEndDate?.();
                    }}
                  >
                    <DefaultIcons.Custom
                      library='Ionicons'
                      name='add-circle-sharp'
                      size={26}
                      color={Pallete.primary}
                      style={{ opacity: 0.9, width: 25 }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <DateInput control={control} name={'dataTermino'} disabled={disabled} />
                  <TouchableOpacity
                    onPress={() => {
                      setEndDateMode('clear');
                      setValue('dataTermino', undefined, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue('recorrencia', RecorrenciaEnum.Semanal, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      onClearEndDate?.();
                    }}
                  >
                    <DefaultIcons.Custom
                      library='Ionicons'
                      name='close-circle-sharp'
                      size={26}
                      color={Pallete.error}
                      style={{
                        opacity: 0.9,
                        borderWidth: 0,
                        width: 25,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
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
          <View style={{ flexDirection: 'row', gap: 5, flex: 1, overflow: 'hidden' }}>
            <FancyDatePickerModal
              disabled={disabled}
              value={value as Date}
              onChange={(date) => {
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
              containerStyle={{ flex: 1 }}
            />

            <FancyTimePickerModal
              disabled={disabled}
              value={{
                hour: Number(format(value as Date, 'HH')),
                minute: Number(format(value as Date, 'mm')),
              }}
              onChange={(time) => {
                const y = (value as Date).getFullYear();
                const m = (value as Date).getMonth();
                const d = (value as Date).getDate();
                const newDate = new Date(y, m, d, time.hour, time.minute);

                if ((value as Date)?.getTime() !== newDate.getTime()) {
                  fieldOnChange(newDate);
                  onChange?.(newDate);
                }
              }}
              containerStyle={{ flex: 1 }}
            />
          </View>
        );
      }}
    />
  );
}
