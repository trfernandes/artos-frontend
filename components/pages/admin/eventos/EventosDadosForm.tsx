import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import FancyScrollView from '../../../FancyScrollView';
import EventoRepeticaoInput, { RecorrenciaValue } from './EventoRepeticaoInput';
import EventoDatesInput from './EventoDatesInput';
import { useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventos';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledColorPicker from '../../../forms/ControlledColorPicker';

export default function EventosDadosForm() {
  const [recorrenciaValue, setRecorrenciaValue] = useState<RecorrenciaValue>({
    type: 'Nunca',
  });
  const { control } = useFormContext<EventoFormData>();

  return (
    <View style={{ flex: 1 }}>
      <FancyScrollView contentContainerStyle={styles.fields}>
        <ControlledTextInput control={control} name="nome" label="Nome" />
        <EventoDatesInput />
        <EventoRepeticaoInput value={recorrenciaValue} onChange={setRecorrenciaValue} />
        <ControlledTextInput control={control} name="local" label="Local" />
        <ControlledTextArea control={control} name="descricao" label="Descrição" />
        <ControlledColorPicker control={control} name="cor" horizontal label="Cor" />
      </FancyScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 15,
  },
});
