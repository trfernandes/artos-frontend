import { useEffect, useMemo, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyText from '../../../../../components/FancyText';
import FancyCalendarVertical from '../../../../../components/calendar/FancyCalendarVertical';
import DateAvailabilityAdjustmentModal from '../../../../../components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal';
import { useIndisponibilidadesVoluntariosCrud } from '../../../../../hooks/useIndisponibilidadesVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyError from '../../../../../components/error/FancyError';
import Toast from 'react-native-toast-message';
import { Pallete } from '../../../../../constants/colors';
import FancyFab from '../../../../../components/buttons/FancyFab';
import AddPeriodoModal from '../../../../../components/pages/pessoal/indisponibilidade/AddPeriodModal';
import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { UpsertIndisponibilidadeVoluntarioItemDto } from '../../../../../domain/dtos/IndisponibilidadeVoluntario/upsert-indisponibilidade-voluntario-item.dto';

type ModalState = {
  visible: boolean;
  date?: Date;
  status?: 'available' | 'unavailable';
  motivo?: string | null;
};

export default function IndisponibilidadeIndexPage() {
  const { user, igrejaAtiva } = useAuth();
  const userId = user?.user?.id;
  const igrejaId = igrejaAtiva?.id;

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    status: 'available',
  });
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);

  const { queryStartDate, queryEndDate, calendarStartDate, calendarEndDate } = useMemo(() => {
    const now = new Date();

    const qStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const qEnd = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());

    const cStart = new Date(now.getFullYear(), now.getMonth(), 1);
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

  const initialParams = useMemo(() => {
    if (!userId || !igrejaId) return undefined;
    return {
      igrejaId: igrejaId,
      where: {
        conditions: [
          {
            path: 'voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: userId },
          },
        ],
        conjunction: Conjunction.AND,
      },
    };
  }, [userId, igrejaId]);

  const {
    update: updateData,
    add: addData,
    data,
    removeWithIgreja,
    isLoading: isLoadingData,
    isLoadingMutation: isLoadingMutating,
    isRefetching,
    isError,
    refetch,
    upsertMany,
  } = useIndisponibilidadesVoluntariosCrud({
    initialParams,
    autoFetch: Boolean(userId && igrejaId),
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

  // TOASTS
  const [lazyToastOptions, setLazyToastOptions] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isBusy && lazyToastOptions) {
      Toast.show({
        type: lazyToastOptions.type,
        text1: lazyToastOptions.message,
      });
      setLazyToastOptions(null);
    }
  }, [isBusy, lazyToastOptions]);
  // END TOASTS

  // ✅ marcações: normalize por dia no fuso
  const markedDates = useMemo(
    () =>
      data.map((d) => {
        return {
          date: DateUtilsApi.dateOnlyFromApi(d.data),
          T: d.id,
          color: Pallete.error,
        };
      }),
    [data],
  );

  const handleConfirmAddPeriodo = async (inicio: Date, fim: Date, motivo: string) => {
    if (!userId || !igrejaId) return;
    setShowPeriodoModal(false);

    try {
      const datesBetweenPeriod = DateUtils.generateDatesBetween(inicio, fim);

      const indisponibilidades: UpsertIndisponibilidadeVoluntarioItemDto[] = datesBetweenPeriod.map((d) => {
        return {
          data: DateUtilsApi.dateOnlyToApi(d),
          motivo: motivo?.trim() || undefined,
        };
      });

      await upsertMany({
        voluntarioId: userId,
        igrejaId,
        indisponibilidades,
      });

      setLazyToastOptions({
        type: 'info',
        message: 'Período registrado com sucesso',
        show: true,
      });
    } catch (error) {
      console.error('Erro ao registrar período:', error);
      setLazyToastOptions({
        type: 'error',
        message: 'Erro ao registrar período',
        show: true,
      });
    }
  };

  const closeModal = () => setModalState((prev) => ({ ...prev, visible: false }));

  const handleConfirm = async (mode: 'mark' | 'unmark', date: Date, motivo?: string) => {
    if (!userId || !igrejaId) return;
    const registro = data.find((d) => DateUtilsApi.compareDateOnlyFromApi(d.data, date));
    closeModal();

    try {
      if (mode === 'mark') {
        if (registro?.id) {
          await updateData?.({
            id: registro.id,
            data: {
              data: DateUtilsApi.dateOnlyToApi(date),
              motivo: motivo,
            },
          });
          setLazyToastOptions({
            type: 'success',
            message: 'Motivo atualizado com sucesso!',
            show: true,
          });
        } else {
          await addData?.({
            data: DateUtilsApi.dateOnlyToApi(date),
            voluntarioId: userId,
            igrejaId,
            motivo,
          });
          setLazyToastOptions({
            type: 'info',
            message: 'Data marcada como indisponível!',
            show: true,
          });
        }
      } else if (registro?.id) {
        await removeWithIgreja({ id: registro.id, igrejaId });
        setLazyToastOptions({
          type: 'info',
          message: 'Data disponível novamente!',
          show: true,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      setLazyToastOptions({
        type: 'error',
        message: 'Erro ao atualizar data!',
        show: true,
      });
    }
  };

  // Early return AFTER all hooks
  if (!userId || !igrejaId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <FancyText>Não foi possível carregar suas indisponibilidades.</FancyText>
      </View>
    );
  }

  if (isError) {
    return <FancyError.Default onUpdate={refetch} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FancyPageView style={[styles.container, { opacity: isBusy ? 0 : 1 }]}>
        <FancyCalendarVertical<'id', string>
          highlightCurrentMonth
          disablePastDates
          contentContainerStyle={{ paddingHorizontal: 15 }}
          startDate={calendarStartDate}
          endDate={calendarEndDate}
          markedDates={markedDates}
          onSelectDate={({ date }) => {
            const registro = data.find((d) => DateUtilsApi.compareDateOnlyFromApi(d.data, date));
            setModalState({
              visible: true,
              date: date,
              status: registro ? 'unavailable' : 'available',
              motivo: registro?.motivo ?? null,
            });
          }}
          listProps={{
            bottomSpace: 70,
            showFade: false,
            maintainVisibleContentPosition: false,
          }}
          daysProps={{ markerColor: Pallete.error }}
        />

        <View style={styles.legend}>
          <View style={styles.legendCircle} />
          <FancyText type='bold' size='extraSmall'>
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
  container: { paddingBottom: 50, gap: 10 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  legend: {
    flexDirection: 'row',
    paddingLeft: 15,
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
