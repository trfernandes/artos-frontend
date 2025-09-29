import { useMemo, useState, useTransition } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyText from '../../../../../components/FancyText';
import FancyCalendarVertical from '../../../../../components/calendar/FancyCalendarVertical';
import DateAvailabilityAdjustmentModal from '../../../../../components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal';
import { useIndisponibilidadesVoluntariosForm } from '../../../../../hooks/useIndisponibilidadesVoluntariosForm';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { IndisponibilidadeVoluntario } from '../../../../../domain/models/IndisponibilidadeVoluntario';
import Toast from 'react-native-toast-message';
import { Pallete } from '../../../../../constants/colors';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyFab from '../../../../../components/buttons/FancyFab';
import AddPeriodoModal from '../../../../../components/pages/pessoal/indisponibilidade/AddPeriodModal';
import DateUtils from '../../../../../utils/date_utils';

type ModalState = { visible: boolean; date?: Date; status?: 'available' | 'unavailable'; motivo?: string | null };

export default function IndisponibilidadeIndexPage() {
  const { user } = useAuth();
  const [modalState, setModalState] = useState<ModalState>({ visible: false, status: 'available' });
  const [isMutating, setIsMutating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCalendarReady, setIsCalendarReady] = useState(false);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      endDate: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
    };
  }, []);

  const {
    update: updateData,
    add: addData,
    data,
    remove: removeData,
    isLoading: isLoadingData,
  } = useIndisponibilidadesVoluntariosForm({
    initialParams: {
      where: {
        conditions: [
          { path: 'voluntario', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: user.id } },
          { path: 'data', operator: Operator.GTE, value: { type: ValueType.LITERAL, value: startDate.toDateString() } },
          { path: 'data', operator: Operator.LTE, value: { type: ValueType.LITERAL, value: endDate.toDateString() } },
        ],
        conjunction: Conjunction.AND,
      },
    },
    autoFetch: true,
  });

  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const isBusy = isLoadingData || !isCalendarReady || isMutating || isPending;

  const handleAddPeriodo = async (inicio: Date, fim: Date, motivo: string) => {
    setShowPeriodoModal(false);
    setIsMutating(true);
    try {
      const dates = DateUtils.generateDatesBetween(inicio, fim);
      for (const d of dates) {
        await addData({ data: d, voluntario: user.id, motivo } as IndisponibilidadeVoluntario);
      }
      Toast.show({ type: 'success', text1: 'Período registrado com sucesso' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao registrar período' });
    } finally {
      setIsMutating(false);
    }
  };

  const closeModal = () => setModalState(s => ({ ...s, visible: false }));

  const handleConfirm = (mode: 'mark' | 'unmark', date: Date, motivo?: string) => {
    const registro = data.find(d => new Date(d.data).getTime() === date.getTime());

    closeModal();

    setIsMutating(true);
    (async () => {
      try {
        if (mode === 'mark') {
          if (registro?.id) {
            await updateData({ id: registro.id, data: { data: date, motivo: motivo ?? null } as IndisponibilidadeVoluntario });
            Toast.show({ type: 'success', text1: 'Motivo atualizado com sucesso!' });
          } else {
            await addData({ data: date, voluntario: user.id, motivo } as IndisponibilidadeVoluntario);
            Toast.show({ type: 'success', text1: 'Data marcada como indisponível!' });
          }
        } else if (registro?.id) {
          await removeData(registro.id);
          Toast.show({ type: 'info', text1: 'Data disponível novamente!!' });
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Erro ao atualizar data!' });
      } finally {
        setIsMutating(false);
      }
    })();
  };

  return (
    <View style={{ flex: 1 }} onLayout={() => setIsCalendarReady(true)}>
      <FancyPageView style={styles.container}>
        <FancyCalendarVertical<'id', string>
          highlightCurrentMonth
          disablePastDates
          containerStyle={{ paddingHorizontal: 18 }}
          startDate={startDate}
          endDate={endDate}
          markedDates={data.map(d => ({ date: new Date(d.data), T: d.id }))}
          onSelectDate={({ date }) => {
            if (isBusy) {
              return;
            }

            const registro = data.find(d => new Date(d.data).getTime() === date.getTime());
            setModalState({
              visible: true,
              date,
              status: registro ? 'unavailable' : 'available',
              motivo: registro?.motivo ?? null,
            });
          }}
          listProps={{ bottomSpace: 70 }}
          daysProps={{ markerColor: Pallete.error }}
        />

        <View style={styles.legend}>
          <View style={styles.legendCircle} />
          <FancyText type="mediumItalic" size="small">
            Data Indisponível
          </FancyText>
        </View>

        <FancyFab onPress={() => setShowPeriodoModal(true)} />
      </FancyPageView>

      {modalState.visible && modalState.date && modalState.status && (
        <DateAvailabilityAdjustmentModal
          data={{ date: modalState.date, status: modalState.status, motivo: modalState.motivo ?? undefined }}
          modalProps={{ onClose: closeModal }}
          onConfirm={handleConfirm}
        />
      )}

      {showPeriodoModal && (
        <AddPeriodoModal
          visible={showPeriodoModal}
          modalProps={{ onClose: () => setShowPeriodoModal(false) }}
          onConfirm={handleAddPeriodo}
        />
      )}

      {isBusy && (
        <View style={styles.loadingOverlay}>
          <FancyLoading />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 50, gap: 30 },
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
