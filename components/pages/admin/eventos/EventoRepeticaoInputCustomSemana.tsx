import { Controller, useFormContext } from 'react-hook-form';
import { EventoRepeticaoSchemaData } from './EventoRepeticaoInputCustom';
import FancyDaySelector from '../../../fields/FancyDaySelector';

export default function EventoRepeticaoInputCustomSemana() {
  const repeticaoForm = useFormContext<EventoRepeticaoSchemaData>();

  return (
    <Controller
      control={repeticaoForm.control}
      name='recorrenciaSemanaDias'
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <FancyDaySelector
          label='Dias da Semana'
          mode='weekly'
          selectedValues={value || []}
          onChange={onChange}
          errorMessage={error?.message}
        />
      )}
    />
  );
}
