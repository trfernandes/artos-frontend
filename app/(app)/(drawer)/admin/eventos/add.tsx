import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { eventoSchema } from '../../../../../domain/schemas/eventoSchema';
import { RecorrenciaEnum } from '../../../../../domain/enums/Evento/recorrencia.enum';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { CreateEventoDto } from '../../../../../domain/dtos/Evento/evento.create';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyButton from '../../../../../components/buttons/FancyButton';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export function getDefaultEventoTimes() {
  const now = new Date();

  const rounded = new Date(now);
  rounded.setMinutes(now.getMinutes() < 30 ? 30 : 0);
  if (now.getMinutes() >= 30) {
    rounded.setHours(now.getHours() + 1);
  }
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);

  const dataInicio = rounded;
  const dataTermino = new Date(rounded);
  dataTermino.setHours(dataInicio.getHours() + 1);

  return { dataInicio, dataTermino };
}

export default function EventosAddPage() {
  const { dataInicio, dataTermino } = getDefaultEventoTimes();
  const { igrejaAtiva } = useAuth();

  const form = useForm({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      recorrencia: RecorrenciaEnum.Nunca,
      cor: '#FF8C00',
      dataInicio: dataInicio,
      dataTermino: dataTermino,
    },
  });

  const { add, isError, isLoading, isLoadingMutation } = useEventosCrud();

  const handleSubmit = async () => {
    form.handleSubmit(
      async (data) => {
        const newEvento: CreateEventoDto = {
          ...data,
          igrejaId: igrejaAtiva!.id,
          cor: data.cor,
          dataInicio: DateUtilsApi.dateTimeToApi(data.dataInicio),
          dataTermino: data.dataTermino && DateUtilsApi.dateTimeToApi(data.dataTermino),
          recorrencia: data.recorrencia || RecorrenciaEnum.Nunca,
        };
        await add(newEvento);
        router.back();
      },
      (errors) => {
        if (__DEV__) {
          console.log('[Admin/Eventos] Validation errors:', errors);
        }
        Toast.show({
          type: 'error',
          text1: 'Erro de validação',
          text2: 'Verifique os campos do formulário',
        });
      },
    )();
  };

  if (isLoadingMutation) return <FancyLoading label='Salvando...' />;

  if (isLoading) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...form}>
        <EventosDadosForm />
        <FancyButton
          containerStyle={{ margin: 15, marginBottom: 0 }}
          label={isLoading ? 'Salvando...' : 'Salvar'}
          disabled={isLoading}
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          type='contained'
          onPress={handleSubmit}
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
    paddingBottom: 5,
  },
});
