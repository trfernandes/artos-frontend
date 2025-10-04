import { View, StyleSheet } from 'react-native';
import FancyScrollView from '../../../FancyScrollView';
import EventoRepeticaoInput from './EventoRepeticaoInput';
import { useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventosCrud';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledColorPicker from '../../../forms/ControlledColorPicker';
import EventoDatesInput from './EventoDatesInput';

export default function EventosDadosForm() {
  const { control, watch } = useFormContext<EventoFormData>();

  return (
    <View style={{ flex: 1 }}>
      <FancyScrollView contentContainerStyle={styles.fields}>
        <ControlledTextInput control={control} name="nome" label="Nome" />
        <EventoDatesInput />
        <EventoRepeticaoInput />
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
