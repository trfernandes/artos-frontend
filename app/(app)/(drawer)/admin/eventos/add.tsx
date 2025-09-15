import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { FormProvider, useForm } from 'react-hook-form';
import { EventoFormData, eventoSchema } from '../../../../../hooks/useEventos';
import { zodResolver } from '@hookform/resolvers/zod';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import { RecorrenciaEnum } from '../../../../../domain/models/Evento';

export function getDefaultEventoTimes() {
  const now = new Date();

  const rounded = new Date(now);
  rounded.setMinutes(now.getMinutes() < 30 ? 30 : 0);
  if (now.getMinutes() >= 30) {
    rounded.setHours(now.getHours() + 1);
  }
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);

  // Definir início e término
  const dataInicio = rounded;
  const dataTermino = new Date(rounded);
  dataTermino.setHours(dataInicio.getHours() + 1);

  return { dataInicio, dataTermino };
}

export default function EventosAddPage() {
  const { dataInicio, dataTermino } = getDefaultEventoTimes();

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      recorrencia: RecorrenciaEnum.Nunca,
      // recorrenciaSemanaDias: [],
      dataInicio: dataInicio,
      dataTermino: dataTermino,
    },
  });

  const onSubmit = (data: any) => {
    console.log('HandleSubmit --- Data', data);
  };

  const onError = (errors: any) => {
    console.log('HandleSubmit Errors', errors);
  };

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...form}>
        <EventosDadosForm />
        <FancyButton
          label="Salvar"
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          type="contained"
          onPress={() => {
            form.handleSubmit(onSubmit, onError)();
          }}
        />
      </FormProvider>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 0,
    borderColor: 'lightgreen',
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
});
