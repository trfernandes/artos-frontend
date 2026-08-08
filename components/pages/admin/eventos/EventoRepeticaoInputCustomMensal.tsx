import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoRepeticaoSchemaData } from './EventoRepeticaoInputCustom';
import FancyDaySelector from '../../../fields/FancyDaySelector';
import { FancyMonthsSlider } from '../../../FancyMonthsSlider';
import FancyText from '../../../FancyText';

export default function EventoRepeticaoInputCustomMensal() {
  const form = useFormContext<EventoRepeticaoSchemaData>();

  return (
    <View style={{ gap: 22 }}>
      {/* A cada quantos meses */}
      <Controller
        control={form.control}
        name='recorrenciaACadaMeses'
        render={({ field: { value, onChange } }) => {
          const v = Number(value) || 1;
          return (
            <FancyMonthsSlider
              title={
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FancyText size='small' type='medium' style={{ opacity: 0.7 }}>
                    A cada quantos meses
                  </FancyText>
                  <FancyText
                    size='small'
                    type='bold'
                  >{`${v} ${v === 1 ? 'mês' : 'meses'}`}</FancyText>
                </View>
              }
              value={v}
              onChange={onChange}
            />
          );
        }}
      />

      {/* Semana do mês — seleção única */}
      <Controller
        control={form.control}
        name='recorrenciaSemanasMes'
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FancyDaySelector
            label='Semana do mês'
            mode='weekOfMonth'
            selectedValues={value || []}
            onChange={onChange}
            singleSelect
            errorMessage={error?.message}
          />
        )}
      />

      {/* Dia da semana — seleção única */}
      <Controller
        control={form.control}
        name='recorrenciaSemanaDias'
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FancyDaySelector
            label='Dia da semana'
            mode='weekly'
            selectedValues={value || []}
            onChange={onChange}
            singleSelect
            errorMessage={error?.message}
          />
        )}
      />
    </View>
  );
}
