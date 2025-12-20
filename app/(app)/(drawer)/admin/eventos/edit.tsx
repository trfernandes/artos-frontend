import { StyleSheet, View } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { EventoFormData, eventoSchema, useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { router, useLocalSearchParams } from 'expo-router';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { useEffect } from 'react';
import { toZonedTime } from 'date-fns-tz';

export default function EventosEditPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    data: eventosData,
    isLoading: isLoadingEvento,
    isLoadingMutation: isLoadingEventoMutation,
    update: updateEvento,
  } = useEventosCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [{ path: 'id', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: params.id } }],
      },
    },
  });

  const eventoForm = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
  });

  useEffect(() => {
    if (eventosData?.length >= 1) {
      eventoForm.setValue('id', eventosData[0]?.id);
      eventoForm.setValue('nome', eventosData[0]?.nome ?? '');
      eventoForm.setValue('local', eventosData[0]?.local ?? '');
      eventoForm.setValue('cor', eventosData[0]?.cor ?? '#FF8C00');
      eventoForm.setValue('dataInicio', toZonedTime(eventosData[0]?.dataInicio, 'America/Sao_Paulo'));
      eventoForm.setValue(
        'dataTermino',
        eventosData[0]?.dataTermino ? toZonedTime(eventosData[0]?.dataTermino, 'America/Sao_Paulo') : null
      );
      eventoForm.setValue('descricao', eventosData[0]?.descricao ?? '');
      eventoForm.setValue('recorrencia', eventosData[0]?.recorrencia);
      eventoForm.setValue('recorrenciaSemanaDias', eventosData[0]?.recorrenciaSemanaDias?.map(item => item) || []);
      eventoForm.setValue('recorrenciaACadaMeses', eventosData[0]?.recorrenciaACadaMeses || 1);
      eventoForm.setValue('recorrenciaSemanasMes', eventosData[0]?.recorrenciaSemanasMes?.map(item => item) || []);
    }
  }, [eventosData]);

  if (isLoadingEvento) {
    return <FancyLoading />;
  }

  if (isLoadingEventoMutation) {
    return <FancyLoading label="Processando..." />;
  }

  const handleSubmit = async () => {
    eventoForm.handleSubmit(
      async data => {
        await updateEvento({
          id: data.id!,
          data: {
            ...data,
          },
        });
        router.back();
      },
      error => console.log(error)
    )();
  };

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...eventoForm}>
        <EventosDadosForm />
      </FormProvider>
      <View style={styles.buttons}>
        <FancyButton
          label="Salvar"
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          type="contained"
          onPress={handleSubmit}
        />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 0,
    borderColor: 'lightgreen',
    paddingVertical: 15,
    gap: 15,
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  fields: {
    gap: 15,
    paddingVertical: 5,
    borderWidth: 0,
    borderColor: 'red',
  },
  buttons: { paddingHorizontal: 18 },
  tabsContainer: { flex: 1 },
});
