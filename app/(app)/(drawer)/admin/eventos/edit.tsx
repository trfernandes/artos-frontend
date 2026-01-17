import { StyleSheet, View } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { useEffect } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { EventoFormData, eventoSchema } from '../../../../../domain/schemas/eventoSchema';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { DateUtilsApi } from '../../../../../utils/date_utils';

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
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: params.id },
          },
        ],
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
        eventosData[0]?.dataTermino ? toZonedTime(eventosData[0]?.dataTermino, 'America/Sao_Paulo') : undefined,
      );
      eventoForm.setValue('descricao', eventosData[0]?.descricao ?? '');
      eventoForm.setValue('recorrencia', eventosData[0]?.recorrencia);
      eventoForm.setValue('recorrenciaSemanaDias', eventosData[0]?.recorrenciaSemanaDias?.map((item) => item) || []);
      eventoForm.setValue('recorrenciaACadaMeses', eventosData[0]?.recorrenciaACadaMeses || 1);
      eventoForm.setValue('recorrenciaSemanasMes', eventosData[0]?.recorrenciaSemanasMes?.map((item) => item) || []);
    }
  }, [eventosData]);

  if (isLoadingEvento) {
    return <FancyLoading />;
  }

  if (isLoadingEventoMutation) {
    return <FancyLoading label='Salvando...' />;
  }

  const handleSubmit = async () => {
    eventoForm.handleSubmit(
      async (data) => {
        await updateEvento({
          id: data.id!,
          data: {
            ...data,
            dataInicio: DateUtilsApi.dateTimeToApi(data.dataInicio),
            dataTermino: data.dataTermino ? DateUtilsApi.dateTimeToApi(data.dataTermino) : undefined,
          },
        });
        router.back();
      },
      (error) => console.log(error),
    )();
  };

  return (
    <FancyPageView>
      <FormProvider {...eventoForm}>
        <EventosDadosForm />
      </FormProvider>
      <View style={styles.buttons}>
        <FancyButton label='Salvar' icon={{ ...DefaultIconsNames.save, size: 16 }} type='contained' onPress={handleSubmit} />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  buttons: { paddingHorizontal: 15 },
});
