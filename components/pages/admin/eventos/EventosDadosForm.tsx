import { View, StyleSheet } from 'react-native';
import FancyScrollView, { FancyScrollViewProps } from '../../../FancyScrollView';
import EventoRepeticaoInput from './EventoRepeticaoInput';
import { useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventosCrud';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledColorPicker from '../../../forms/ControlledColorPicker';
import EventoDatesInput from './EventoDatesInput';

interface EventosDadosFormProps {
  onlyView?: boolean;
  scrollViewProps?: FancyScrollViewProps;
}

export default function EventosDadosForm({ onlyView = false, scrollViewProps }: EventosDadosFormProps) {
  const { control } = useFormContext<EventoFormData>();

  return (
    <View style={{ flex: 1 }}>
      <FancyScrollView contentContainerStyle={styles.fields} {...scrollViewProps}>
        <ControlledTextInput control={control} name="nome" label="Nome" disabled={onlyView} />
        <EventoDatesInput disabled={onlyView} />
        <EventoRepeticaoInput disabled={onlyView} />
        <ControlledTextInput control={control} name="local" label="Local" disabled={onlyView} />
        <ControlledTextArea control={control} name="descricao" label="Descrição" disabled={onlyView} />
        <ControlledColorPicker control={control} name="cor" horizontal label="Cor" disabled={onlyView} />
      </FancyScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 15,
  },
});
