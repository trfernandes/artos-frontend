import { useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import z from 'zod';
import ControlledSearchSelect from '../../../../../components/forms/ControlledSearchSelect';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIndisponibilidadesVoluntariosCrud } from '../../../../../hooks/useIndisponibilidadesVoluntariosCrud';
import { useMemo, useState } from 'react';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyError from '../../../../../components/error/FancyError';
import FancyLoading from '../../../../../components/FancyLoading';
import { Pallete } from '../../../../../constants/colors';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyVerticalSpacer from '../../../../../components/FancyVerticalSpacer';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';
import AddPeriodoModal from '../../../../../components/pages/pessoal/indisponibilidade/AddPeriodModal';
import Toast from 'react-native-toast-message';
import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
import DateAvailabilityAdjustmentModal from '../../../../../components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal';
import { useAuth } from '../../../../../contexts/AuthContext';

type ModalState = {
  visible: boolean;
  date?: Date;
  status?: 'available' | 'unavailable';
  motivo?: string | null;
};

const schema = z.object({
  voluntarioId: z.string('Campo obrigatório').min(1, 'Selecione um voluntário'),
  indisponibilidades: z.array(z.date()).min(1, 'Selecione ao menos uma indisponibilidade'),
});

export default function MinisterioIndisponibilidadesIndex() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId?: string }>();
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;

  const {
    voluntariosList,
    voluntariosDropDownList,
    isLoading: isLoadingVoluntarios,
  } = useVoluntariosDoMinisterioCrud(ministerioId);

  const { control, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      voluntarioId: voluntariosList[0]?.id,
      indisponibilidades: [],
    },
  });

  const voluntarioId = watch('voluntarioId');

  const initialParams = useMemo(() => {
    if (!voluntarioId || !igrejaId) return undefined;
    return {
      igrejaId: igrejaId,
      where: {
        conditions: [
          {
            path: 'voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: voluntarioId },
          },
        ],
        conjunction: Conjunction.AND,
      },
    };
  }, [voluntarioId, igrejaId]);

  const {
    data: indisponibilidadesData,
    add: addIndisponibilidade,
    update: updateIndisponibilidade,
    removeWithIgreja,
    isLoading: isLoadingIndisponibilidades,
    isLoadingMutation: isLoadingIndisponibilidadesMutation,
    isError: isErrorIndisponibilidades,
    refetch: refetchIndisponibilidades,
    upsertMany,
  } = useIndisponibilidadesVoluntariosCrud({
    autoFetch: Boolean(voluntarioId && igrejaId),
    initialParams,
  });

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      endDate: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
    };
  }, []);

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    status: 'available',
  });
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

  const handleAddPeriodo = async (inicio: Date, fim: Date, motivo: string) => {
    setShowPeriodoModal(false);
    if (!voluntarioId || !igrejaId) return;
    try {
      const dates = DateUtils.generateDatesBetween(inicio, fim);
      const indisponibilidadesExistentes = dates.map((d) => ({
        data: DateUtilsApi.dateOnlyToApi(d),
        motivo: motivo?.trim() || undefined,
      }));

      await upsertMany({
        voluntarioId,
        igrejaId,
        indisponibilidades: indisponibilidadesExistentes,
      });
      Toast.show({ type: 'success', text1: 'Período registrado com sucesso' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao registrar período' });
    }
  };

  const closeModal = () => setModalState((s) => ({ ...s, visible: false }));

  const handleConfirm = (mode: 'mark' | 'unmark', date: Date, motivo?: string) => {
    const registro = indisponibilidadesData.find((d) => new Date(d.data).getTime?.() === date.getTime?.());

    closeModal();

    (async () => {
      try {
        if (mode === 'mark') {
          if (registro?.id) {
            await updateIndisponibilidade({
              id: registro.id,
              data: {
                data: DateUtilsApi.dateOnlyToApi(date),
                motivo: motivo,
              },
            });
            Toast.show({
              type: 'success',
              text1: 'Motivo atualizado com sucesso!',
            });
          } else {
            if (!igrejaId) return;
            await addIndisponibilidade({
              data: DateUtilsApi.dateOnlyToApi(date),
              voluntarioId: voluntarioId,
              igrejaId,
              motivo,
            });
            Toast.show({
              type: 'success',
              text1: 'Data marcada como indisponível!',
            });
          }
        } else if (registro?.id && igrejaId) {
          await removeWithIgreja({ id: registro.id, igrejaId });
          Toast.show({
            type: 'info',
            text1: 'Data disponível novamente!!',
          });
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Erro ao atualizar data!' });
      }
    })();
  };

  if (isLoadingIndisponibilidades || isLoadingVoluntarios || isLoadingIndisponibilidadesMutation) {
    return <FancyLoading />;
  }

  if (isErrorIndisponibilidades) {
    return <FancyError.Default onUpdate={refetchIndisponibilidades} />;
  }

  return (
    <FancyPageView style={styles.container}>
      <View style={styles.voluntarioContainer}>
        <ControlledSearchSelect control={control} name='voluntarioId' label='Voluntário' searchPlaceholder='Buscar voluntário...' listItems={voluntariosDropDownList} />
      </View>
      {voluntarioId && !isLoadingIndisponibilidades ? (
        <View>
          <FancyVerticalSpacer height={15} />
          <FancyCalendar
            selectDateOnPress={false}
            onChangeSelectedDate={(date) => {
              const registro = indisponibilidadesData.find((d) => new Date(d.data).getTime() === date.getTime());
              setModalState({
                visible: true,
                date,
                status: registro ? 'unavailable' : 'available',
                motivo: registro?.motivo ?? null,
              });
            }}
            containerStyle={{ paddingHorizontal: 5 }}
            minimumDate={startDate}
            maximumDate={endDate}
            markedDates={indisponibilidadesData.map((d) => ({
              date: new Date(d.data),
              T: d.id,
              color: Pallete.error,
            }))}
            markedDatesType='SurroundCircle'
          />
          <FancyVerticalSpacer height={15} />
          <FancyButton
            label='Adicionar Período'
            icon={{ ...DefaultIconsNames.add, size: 20 }}
            onPress={() => setShowPeriodoModal(true)}
          />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FancyListEmpty label='Nenhum voluntário selecionado...' icon={{ library: 'MaterialCommunityIcons', name: 'calendar-remove-outline', size: 55 }} />
        </View>
      )}

      {modalState.visible && modalState.date && modalState.status && (
        <DateAvailabilityAdjustmentModal
          data={{
            date: modalState.date,
            status: modalState.status,
            motivo: modalState.motivo ?? undefined,
          }}
          modalProps={{ onButton1Press: closeModal }}
          onConfirm={handleConfirm}
        />
      )}

      {showPeriodoModal && (
        <AddPeriodoModal
          visible={showPeriodoModal}
          modalProps={{ onButton1Press: () => setShowPeriodoModal(false) }}
          onConfirm={handleAddPeriodo}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 10, flex: 1, paddingHorizontal: 20 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  legend: {
    flexDirection: 'row',
    paddingLeft: 20,
    alignItems: 'center',
    gap: 8,
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Pallete.error,
  },
  voluntarioContainer: { paddingTop: 5 },
});
