import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { router, useLocalSearchParams } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FancyLoading from '../../../../../components/FancyLoading';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useEventosCrud, EventoFormData, eventoSchema } from '../../../../../hooks/useEventosCrud';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EditEscalaTab from '../../../../../components/pages/ministerios/escalas/EditEscalaTab';
import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyDropDown from '../../../../../components/fields/FancyDropDown';
import FancyScrollView from '../../../../../components/FancyScrollView';

export default function MinisterioEscalasEditPage() {
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
      eventoForm.setValue('dataInicio', new Date(eventosData[0]?.dataInicio));
      eventoForm.setValue('dataTermino', new Date(eventosData[0]?.dataTermino));
      eventoForm.setValue('descricao', eventosData[0]?.descricao ?? '');
      eventoForm.setValue('recorrencia', eventosData[0]?.recorrencia);
      eventoForm.setValue(
        'recorrenciaSemanaDias',
        eventosData[0]?.recorrenciaSemanaDias?.map(item => Number(item)) || []
      );
      eventoForm.setValue('recorrenciaACadaMeses', eventosData[0]?.recorrenciaACadaMeses || 1);
      eventoForm.setValue(
        'recorrenciaSemanasMes',
        eventosData[0]?.recorrenciaSemanasMes?.map(item => Number(item)) || []
      );
    }
  }, [eventosData]);

  const tabs: TabItem[] = [
    {
      title: 'Dados',
      icon: { ...DefaultIconsNames.info, size: 18 },
      content: (
        <FormProvider {...eventoForm}>
          <FancyScrollView
            contentContainerStyle={{ gap: 15, paddingTop: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <EventosDadosForm onlyView scrollViewProps={{ scrollEnabled: false }} />
            <FancyDropDown label="Template Padrão" />
          </FancyScrollView>
        </FormProvider>
      ),
    },
    {
      title: 'Escala',
      icon: { library: 'MaterialCommunityIcons', name: 'calendar-account', size: 18 },
      content: <EditEscalaTab />,
    },
    // {
    //   title: 'Setlist',
    //   icon: { library: 'MaterialCommunityIcons', name: 'playlist-music', size: 20 },
    //   content: <EditSetListTab />,
    // },
  ];

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
      <FancyTabs items={tabs} containerStyle={styles.tabsContainer} contentContainerStyle={{ flex: 1 }} />

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
  buttons: { paddingHorizontal: 5 },
  tabsContainer: { flex: 1, paddingHorizontal: 5 },
});
