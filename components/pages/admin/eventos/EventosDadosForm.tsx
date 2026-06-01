import { View, StyleSheet } from 'react-native';
import FancyFormScrollView, { FancyFormScrollViewProps } from '../../../FancyFormScrollView';
import EventoRepeticaoInput from './EventoRepeticaoInput';
import { useFormContext } from 'react-hook-form';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledColorPicker from '../../../forms/ControlledColorPicker';
import EventoDatesInput from './EventoDatesInput';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import EventoRepeticaoInputCustom from './EventoRepeticaoInputCustom';
import { useState } from 'react';

interface EventosDadosFormProps {
  onlyView?: boolean;
  scrollViewProps?: FancyFormScrollViewProps;
}

export default function EventosDadosForm({
  onlyView = false,
  scrollViewProps,
}: EventosDadosFormProps) {
  const { control } = useFormContext<EventoFormData>();
  const [repeticaoModalVisible, setRepeticaoModalVisible] = useState(false);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <FancyFormScrollView contentContainerStyle={styles.fields} {...scrollViewProps}>
        <ControlledTextInput control={control} name='nome' label='Nome' disabled={onlyView} />
        <EventoDatesInput disabled={onlyView} />
        <EventoRepeticaoInput
          disabled={onlyView}
          setRepeticaoModalVisible={setRepeticaoModalVisible}
        />
        <ControlledTextInput control={control} name='local' label='Local' disabled={onlyView} />
        <ControlledTextArea
          control={control}
          name='descricao'
          label='Descrição'
          disabled={onlyView}
        />
        <ControlledColorPicker control={control} name='cor' horizontal disabled={onlyView} />
      </FancyFormScrollView>

      {repeticaoModalVisible && (
        <EventoRepeticaoInputCustom
          modalProps={{
            visible: repeticaoModalVisible,
            onRequestClose: () => setRepeticaoModalVisible(false),
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 15,
    paddingHorizontal: 15,
  },
});
