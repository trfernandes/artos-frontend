import { useEffect, useMemo, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyText from '../../../../../components/FancyText';
import FancyCalendarVertical from '../../../../../components/calendar/FancyCalendarVertical';
import DateAvailabilityAdjustmentModal from '../../../../../components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal';
import { useIndisponibilidadesVoluntariosCrud } from '../../../../../hooks/useIndisponibilidadesVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { IndisponibilidadeVoluntario } from '../../../../../domain/models/IndisponibilidadeVoluntario';
import Toast from 'react-native-toast-message';
import { Pallete } from '../../../../../constants/colors';
import FancyFab from '../../../../../components/buttons/FancyFab';
import AddPeriodoModal from '../../../../../components/pages/pessoal/indisponibilidade/AddPeriodModal';
import DateUtils from '../../../../../utils/date_utils';
import FancyLoading from '../../../../../components/FancyLoading';

type ModalState = {
  visible: boolean;
  date?: Date;
  status?: 'available' | 'unavailable';
  motivo?: string | null;
};

export default function IndisponibilidadeIndexPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [modalState, setModalState] = useState<ModalState>({ visible: false, status: 'available' });
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  // ✅ estado para saber se a UI já "assentou" depois do loading
  const [hasSettled, setHasSettled] = useState(false);

  if (!userId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <FancyText>Não foi possível carregar suas indisponibilidades.</FancyText>
      </View>
    );
  }

  const { queryStartDate, queryEndDate, calendarStartDate, calendarEndDate } = useMemo(() => {
    const now = new Date();

    const qStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); // 1 mês antes
    const qEnd = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()); // +2 meses

    const cStart = new Date(now.getFullYear(), now.getMonth(), 1); // mês ATUAL, dia 1
    const cEnd = new Date(qEnd);

    qStart.setHours(0, 0, 0, 0);
    qEnd.setHours(0, 0, 0, 0);
    cStart.setHours(0, 0, 0, 0);
    cEnd.setHours(0, 0, 0, 0);

    return {
      queryStartDate: qStart,
      queryEndDate: qEnd,
      calendarStartDate: cStart,
      calendarEndDate: cEnd,
    };
  }, []);

  const {
    update: updateData,
    add: addData,
    data,
    remove: removeData,
    isLoading: isLoadingData,
    isLoadingMutation: isLoadingMutating,
    isRefetching,
    upsertMany,
  } = useIndisponibilidadesVoluntariosCrud({
    initialParams: {
      where: {
        conditions: [
          {
            path: 'voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: userId },
          },
          {
            path: 'data',
            operator: Operator.GTE,
            value: { type: ValueType.LITERAL, value: queryStartDate.toDateString() },
          },
          {
            path: 'data',
            operator: Operator.LTE,
            value: { type: ValueType.LITERAL, value: queryEndDate.toDateString() },
          },
        ],
        conjunction: Conjunction.AND,
      },
    },
    autoFetch: true,
    messages: {},
  });

  const loadingFlags = isLoadingData || isLoadingMutating || isRefetching;

  useEffect(() => {
    if (loadingFlags) {
      setHasSettled(false);
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setHasSettled(true);
    });

    return () => task.cancel();
  }, [loadingFlags]);

  const isBusy = loadingFlags || !hasSettled;

  //TOASTS
  const [lazyToastOptions, setLazyToastOptions] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isBusy && lazyToastOptions) {
      Toast.show({ type: lazyToastOptions.type, text1: lazyToastOptions.message });
      setLazyToastOptions(null);
    }
  }, [isBusy, lazyToastOptions]);
  //END TOASTS

  const markedDates = useMemo(
    () =>
      data.map(d => ({
        date: new Date(d.data),
        T: d.id,
        color: Pallete.error,
      })),
    [data]
  );

  const handleConfirmAddPeriodo = async (inicio: Date, fim: Date, motivo: string) => {
    setShowPeriodoModal(false);

    try {
      const datesBetweenPeriod = DateUtils.generateDatesBetween(inicio, fim);

      const indisponibilidades = datesBetweenPeriod.map(d => {
        const normalizedDate = new Date(d);
        normalizedDate.setHours(0, 0, 0, 0);
        return {
          data: normalizedDate.toDateString(),
          motivo: motivo?.trim() || undefined,
        };
      });

      await upsertMany({
        voluntarioId: userId,
        indisponibilidades: indisponibilidades,
      });

      setLazyToastOptions({ type: 'info', message: 'Período registrado com sucesso', show: true });
    } catch (error) {
      console.error('Erro ao registrar período:', error);
      setLazyToastOptions({ type: 'error', message: 'Erro ao registrar período', show: true });
    }
  };

  const closeModal = () => setModalState(prev => ({ ...prev, visible: false }));

  const handleConfirm = async (mode: 'mark' | 'unmark', date: Date, motivo?: string) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const registro = data.find(d => DateUtils.equal(new Date(d.data), normalizedDate));

    closeModal();

    try {
      if (mode === 'mark') {
        if (registro?.id) {
          await updateData({
            id: registro.id,
            data: { data: normalizedDate, motivo: motivo ?? null } as IndisponibilidadeVoluntario,
          });
          setLazyToastOptions({ type: 'success', message: 'Motivo atualizado com sucesso!', show: true });
        } else {
          await addData({
            data: normalizedDate,
            voluntarioId: userId,
            motivo,
          } as IndisponibilidadeVoluntario);
          setLazyToastOptions({ type: 'info', message: 'Data marcada como indisponível!', show: true });
        }
      } else if (registro?.id) {
        await removeData(registro.id);
        setLazyToastOptions({ type: 'info', message: 'Data disponível novamente!', show: true });
      }
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      setLazyToastOptions({ type: 'error', message: 'Erro ao atualizar data!', show: true });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FancyPageView style={[styles.container, { opacity: isBusy ? 0 : 1 }]}>
        <FancyCalendarVertical<'id', string>
          highlightCurrentMonth
          disablePastDates
          contentContainerStyle={{ paddingHorizontal: 20 }}
          startDate={calendarStartDate}
          endDate={calendarEndDate}
          markedDates={markedDates}
          onSelectDate={({ date }) => {
            const normalizedDate = new Date(date);
            normalizedDate.setHours(0, 0, 0, 0);

            const registro = data.find(d => DateUtils.equal(new Date(d.data), normalizedDate));

            setModalState({
              visible: true,
              date: normalizedDate,
              status: registro ? 'unavailable' : 'available',
              motivo: registro?.motivo ?? null,
            });
          }}
          listProps={{ bottomSpace: 70 }}
          daysProps={{ markerColor: Pallete.error }}
        />

        <View style={styles.legend}>
          <View style={styles.legendCircle} />
          <FancyText type="bold" size="extraSmall">
            Datas indisponíveis
          </FancyText>
        </View>

        <FancyFab onPress={() => setShowPeriodoModal(true)} bottom={5} />
      </FancyPageView>

      {isBusy && (
        <View style={styles.loadingOverlay}>
          <FancyLoading />
        </View>
      )}

      {modalState.visible && (
        <DateAvailabilityAdjustmentModal
          data={{
            date: modalState.date!,
            status: modalState.status!,
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
          onConfirm={handleConfirmAddPeriodo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 50, gap: 30, paddingTop: 5 },
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
});
