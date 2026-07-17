import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, InteractionManager, StyleSheet, View } from 'react-native';
import FancyCalendarVertical from '../../../../../components/calendar/FancyCalendarVertical';
import DateAvailabilityAdjustmentModal from '../../../../../components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal';
import { useIndisponibilidadesVoluntariosCrud } from '../../../../../hooks/useIndisponibilidadesVoluntariosCrud';
import { useRegrasIndisponibilidadeVoluntariosCrud } from '../../../../../hooks/useRegrasIndisponibilidadeVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyError from '../../../../../components/error/FancyError';
import Toast from 'react-native-toast-message';
import { ThemePalette } from '../../../../../constants/colors';
import FancyFab from '../../../../../components/buttons/FancyFab';
import FancyButton from '../../../../../components/buttons/FancyButton';
import AddPeriodoModal from '../../../../../components/pages/pessoal/indisponibilidade/AddPeriodModal';
import AddRegraModal, {
  AddRegraModalResult,
} from '../../../../../components/pages/pessoal/indisponibilidade/AddRegraModal';
import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { UpsertIndisponibilidadeVoluntarioItemDto } from '../../../../../domain/dtos/IndisponibilidadeVoluntario/upsert-indisponibilidade-voluntario-item.dto';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';
import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../../../../../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import FancyScrollView from '../../../../../components/FancyScrollView';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyText from '../../../../../components/FancyText';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';
import { TutorialTarget } from '../../../../../components/tutorial/TutorialTarget';
import { TutorialBanner } from '../../../../../components/tutorial/TutorialBanner';
import { TutorialOverlay } from '../../../../../components/tutorial/TutorialOverlay';
import { useScreenTutorial } from '../../../../../hooks/useScreenTutorial';
import {
  INDISPONIBILIDADES_TOUR_ID,
  INDISPONIBILIDADES_TOUR_STEPS,
  INDISPONIBILIDADES_TOUR_TITLE,
} from '../../../../../components/tutorial/tours/indisponibilidadesTour';

type ModalState = {
  visible: boolean;
  date?: Date;
  status?: 'available' | 'unavailable';
  motivo?: string | null;
};

const DIA_NOMES_COMPLETOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const DIA_NOMES_PLURAL = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'];
const DIA_ARTIGO_SINGULAR = ['no domingo', 'na segunda', 'na terça', 'na quarta', 'na quinta', 'na sexta', 'no sábado'];
const isMasc = (d: number) => d === 0 || d === 6;

function descreverRegra(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA' && regra.diasSemana) {
    const sorted = [...regra.diasSemana].sort((a, b) => a - b);
    if (sorted.length === 7) return 'Indisponível todos os dias';
    if (sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6)
      return 'Indisponível nos fins de semana';
    if (sorted.length === 5 && sorted.join(',') === '1,2,3,4,5')
      return 'Indisponível em dias úteis';
    const allMasc = sorted.every(isMasc);
    const allFem = sorted.every((d) => !isMasc(d));
    if (allMasc) return 'Indisponível nos ' + sorted.map((d) => DIA_NOMES_PLURAL[d]).join(', ');
    if (allFem) return 'Indisponível nas ' + sorted.map((d) => DIA_NOMES_PLURAL[d]).join(', ');
    return 'Indisponível ' + sorted.map((d) => (isMasc(d) ? 'nos ' : 'nas ') + DIA_NOMES_PLURAL[d]).join(', ');
  }
  if (regra.tipo === 'PERIODO') {
    const fmtDateOnly = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
    const inicio = regra.dataInicio ? fmtDateOnly(regra.dataInicio) : '?';
    const fim = regra.dataFim ? fmtDateOnly(regra.dataFim) : '?';
    return `Indisponível de ${inicio} a ${fim}${regra.recorrente ? ' (todo ano)' : ''}`;
  }
  if (regra.tipo === 'LIMITE_MENSAL') {
    return `Máximo de ${regra.limiteMensal} escala${(regra.limiteMensal ?? 0) !== 1 ? 's' : ''} por mês`;
  }
  return 'Regra de indisponibilidade';
}

function descreverDetalheRegra(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA' && regra.diasSemana) {
    return [...regra.diasSemana]
      .sort((a, b) => a - b)
      .map((d) => DIA_NOMES_COMPLETOS[d].slice(0, 3))
      .join(', ');
  }
  if (regra.tipo === 'PERIODO') {
    const ini = regra.dataInicio ? new Date(regra.dataInicio + 'T00:00:00Z') : null;
    const fim = regra.dataFim ? new Date(regra.dataFim + 'T00:00:00Z') : null;
    const fmt = (d: Date) =>
      d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    return ini && fim ? `${fmt(ini)} até ${fmt(fim)}` : '';
  }
  if (regra.tipo === 'LIMITE_MENSAL') {
    return 'Restrição de frequência mensal';
  }
  return '';
}

function regraIcone(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA') return 'calendar-week';
  if (regra.tipo === 'LIMITE_MENSAL') return 'counter';
  if (regra.recorrente) return 'calendar-sync';
  return 'calendar-range';
}

function regraChipLabel(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA') return 'Semanal';
  if (regra.tipo === 'LIMITE_MENSAL') return 'Frequência';
  if (regra.recorrente) return 'Anual';
  return 'Período';
}

function expandirRegrasParaCalendario(
  regras: ResponseRegraIndisponibilidadeVoluntarioDto[],
  inicio: Date,
  fim: Date,
): Set<string> {
  const result = new Set<string>();
  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  for (const regra of regras) {
    if (regra.tipo === 'DIAS_SEMANA' && regra.diasSemana) {
      const cur = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
      const endUtc = new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
      while (cur <= endUtc) {
        if (regra.diasSemana.includes(cur.getUTCDay())) {
          result.add(toKey(cur));
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else if (regra.tipo === 'PERIODO' && regra.dataInicio && regra.dataFim) {
      if (regra.recorrente) {
        const mmddInicio = regra.dataInicio.slice(5);
        const mmddFim = regra.dataFim.slice(5);
        const crossYear = mmddInicio > mmddFim;
        const cur = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
        const endUtc = new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
        while (cur <= endUtc) {
          const mmddAtual = toKey(cur).slice(5);
          const incluso = crossYear
            ? mmddAtual >= mmddInicio || mmddAtual <= mmddFim
            : mmddAtual >= mmddInicio && mmddAtual <= mmddFim;
          if (incluso) result.add(toKey(cur));
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      } else {
        const ri = new Date(regra.dataInicio + 'T00:00:00Z');
        const rf = new Date(regra.dataFim + 'T00:00:00Z');
        const rangeIni = ri > inicio ? ri : new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
        const rangeFim = rf < fim ? rf : new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
        const cur = new Date(rangeIni);
        while (cur <= rangeFim) {
          result.add(toKey(cur));
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      }
    }
  }
  return result;
}

export default function IndisponibilidadeIndexPage() {
  const { user, igrejaAtiva } = useAuth();
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const userId = user?.user?.id;
  const igrejaId = igrejaAtiva?.id;

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    status: 'available',
  });
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const [showRegraModal, setShowRegraModal] = useState(false);
  const [editingRegra, setEditingRegra] = useState<ResponseRegraIndisponibilidadeVoluntarioDto | null>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const fabAnim = useRef(new Animated.Value(1)).current;

  const tour = useScreenTutorial(
    INDISPONIBILIDADES_TOUR_ID,
    INDISPONIBILIDADES_TOUR_TITLE,
    INDISPONIBILIDADES_TOUR_STEPS,
  );


  useEffect(() => {
    fabAnim.setValue(0);
    Animated.spring(fabAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 90,
    }).start();
  }, [activeTab]);

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
      igrejaId,
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

  const regrasInitialParams = useMemo(() => {
    if (!userId || !igrejaId) return undefined;
    return {
      igrejaId,
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
    muteMessages: true,
  });

  const {
    add: addRegra,
    update: updateRegra,
    data: regras,
    isLoading: isLoadingRegras,
    isRefetching: isRefetchingRegras,
    isLoadingMutation: isLoadingMutationRegras,
    removeWithIgreja: removeRegraComIgreja,
  } = useRegrasIndisponibilidadeVoluntariosCrud({
    initialParams: regrasInitialParams,
    autoFetch: Boolean(userId && igrejaId),
    muteMessages: false,
  });

  const loadingFlags = isLoadingData || isLoadingMutating || isLoadingRegras || isLoadingMutationRegras;

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

  const markedDatesIndividuais = useMemo(
    () =>
      data.map((d) => ({
        date: DateUtilsApi.dateOnlyFromApi(d.data),
        T: d.id,
        color: palette.error,
      })),
    [data, palette.error],
  );

  const markedDatesRegras = useMemo(() => {
    const individuaisKeys = new Set(
      markedDatesIndividuais.map((m) => m.date.toISOString().slice(0, 10)),
    );
    const regrasKeys = expandirRegrasParaCalendario(
      regras.filter((r) => r.tipo !== 'LIMITE_MENSAL'),
      calendarStartDate,
      calendarEndDate,
    );
    return Array.from(regrasKeys)
      .filter((k) => !individuaisKeys.has(k))
      .map((k) => ({
        date: new Date(k + 'T00:00:00Z'),
        T: k,
        color: palette.secondary,
      }));
  }, [regras, markedDatesIndividuais, calendarStartDate, calendarEndDate, palette.error]);

  const allMarkedDates = useMemo(
    () => [...markedDatesIndividuais, ...markedDatesRegras],
    [markedDatesIndividuais, markedDatesRegras],
  );

  const openDateModal = useCallback(
    (date: Date) => {
      const registro = data.find((d) => DateUtilsApi.compareDateOnlyFromApi(d.data, date));
      setModalState({
        visible: true,
        date,
        status: registro ? 'unavailable' : 'available',
        motivo: registro?.motivo ?? null,
      });
    },
    [data],
  );

  const handleConfirmAddPeriodo = async (inicio: Date, fim: Date, motivo: string) => {
    if (!userId || !igrejaId) return;
    setShowPeriodoModal(false);

    try {
      const datesBetweenPeriod = DateUtils.generateDatesBetween(inicio, fim);

      const indisponibilidades: UpsertIndisponibilidadeVoluntarioItemDto[] = datesBetweenPeriod.map(
        (d) => ({
          data: DateUtilsApi.dateOnlyToApi(d),
          motivo: motivo?.trim() || undefined,
        }),
      );

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

  const handleConfirmAddRegra = async (result: AddRegraModalResult) => {
    if (!userId || !igrejaId) return;
    setShowRegraModal(false);

    try {
      await addRegra?.({
        ...result,
        voluntarioId: userId,
        igrejaId,
      });
      setLazyToastOptions({ type: 'success', message: 'Regra criada com sucesso!', show: true });
    } catch (error) {
      console.error('Erro ao criar regra:', error);
      setLazyToastOptions({ type: 'error', message: 'Erro ao criar regra', show: true });
    }
  };

  const handleConfirmEditRegra = async (result: AddRegraModalResult) => {
    if (!editingRegra || !userId || !igrejaId) return;
    const id = editingRegra.id;
    setEditingRegra(null);

    try {
      const { tipo, diasSemana, dataInicio, dataFim, recorrente, limiteMensal, motivo } = result;
      await updateRegra?.({ id, data: { tipo, diasSemana, dataInicio, dataFim, recorrente, limiteMensal, motivo } });
      setLazyToastOptions({ type: 'success', message: 'Regra atualizada com sucesso!', show: true });
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
      setLazyToastOptions({ type: 'error', message: 'Erro ao atualizar regra', show: true });
    }
  };

  const handleRemoverRegra = useCallback(
    (regra: ResponseRegraIndisponibilidadeVoluntarioDto) => {
      FancyAlert.alert(`Remover regra`, `Deseja remover "${descreverRegra(regra)}"?`, [
        { text: 'Cancelar', style: 'destructive' },
        {
          text: 'Sim',
          onPress: async () => {
            if (!igrejaId) return;
            try {
              await removeRegraComIgreja({ id: regra.id, igrejaId });
            } catch {
              Toast.show({ type: 'error', text1: 'Erro ao remover a regra.' });
            }
          },
        },
      ]);
    },
    [igrejaId, removeRegraComIgreja],
  );

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
              motivo,
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

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        title: 'Calendário',
        icon: { library: 'MaterialCommunityIcons', name: 'calendar-month-outline', size: 18 },
        content: (
          <View style={{ flex: 1 }}>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: palette.error }]} />
                <FancyText type="medium" size="extraSmall" color={palette.fonts.dark}>Dias específicos</FancyText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: palette.secondary }]} />
                <FancyText type="medium" size="extraSmall" color={palette.fonts.dark}>Regras recorrentes</FancyText>
              </View>
            </View>
            <TutorialTarget
              id="indisponibilidade-calendario"
              registerTarget={tour.registerTarget}
              unregisterTarget={tour.unregisterTarget}
              style={{ flex: 1 }}
            >
              <FancyCalendarVertical<'id', string>
                highlightCurrentMonth
                disablePastDates
                contentContainerStyle={{ paddingHorizontal: 15 }}
                startDate={calendarStartDate}
                endDate={calendarEndDate}
                markedDates={allMarkedDates}
                onSelectDate={({ date }) => openDateModal(date)}
                listProps={{
                  bottomSpace: 160,
                  showFade: false,
                  maintainVisibleContentPosition: false,
                }}
                daysProps={{ markerColor: palette.error }}
              />
            </TutorialTarget>
          </View>
        ),
      },
      {
        title: 'Regras',
        icon: { library: 'MaterialCommunityIcons', name: 'calendar-sync-outline', size: 18 },
        content: regras.length ? (
          <FancyScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 8, paddingBottom: 84, gap: 10 }}>
            {regras.map((regra) => (
              <FancyListItemCard
                key={regra.id}
                onPress={() => setEditingRegra(regra)}
                title={descreverRegra(regra)}
                subtitle={
                  <View style={{ gap: 4 }}>
                    <View
                      style={[
                        styles.regraChip,
                        {
                          backgroundColor: ColorUtils.withAlpha(
                            regra.tipo === 'LIMITE_MENSAL' ? palette.warning : palette.secondary,
                            0.1,
                          ),
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      <FancyText
                        size="extraSmall"
                        type="semiBold"
                        color={regra.tipo === 'LIMITE_MENSAL' ? palette.warning : palette.secondary}
                      >
                        {regraChipLabel(regra)}
                      </FancyText>
                    </View>
                    {descreverDetalheRegra(regra) ? (
                      <FancyText size="extraSmall" type="medium" color={palette.fonts.inactive}>
                        {descreverDetalheRegra(regra)}
                      </FancyText>
                    ) : null}
                  </View>
                }
                leading={{
                  type: 'icon',
                  icon: {
                    library: 'MaterialCommunityIcons',
                    name: regraIcone(regra) as any,
                    size: 20,
                  },
                  color: regra.tipo === 'LIMITE_MENSAL' ? palette.warning : palette.secondary,
                  backgroundColor: ColorUtils.withAlpha(
                    regra.tipo === 'LIMITE_MENSAL' ? palette.warning : palette.secondary,
                    0.1,
                  ),
                }}
                trailing={
                  <FancyButton
                    type="light"
                    mode="icon"
                    size={{ w: 32, h: 32 }}
                    icon={{ library: 'MaterialCommunityIcons', name: 'trash-can-outline', size: 17, color: palette.icons.light }}
                    onPress={() => handleRemoverRegra(regra)}
                    accessibilityLabel="Remover regra"
                    containerStyle={{ backgroundColor: palette.error, borderRadius: 16, borderWidth: 0 }}
                  />
                }
              />
            ))}
          </FancyScrollView>
        ) : (
          <FancyListEmpty
            label="Nenhuma regra cadastrada"
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar-remove-outline', size: 55 }}
            muted
          />
        ),
      },
    ],
    [
      calendarStartDate,
      calendarEndDate,
      allMarkedDates,
      palette,
      regras,
      openDateModal,
      handleRemoverRegra,
      styles,
      tour.registerTarget,
      tour.unregisterTarget,
    ],
  );

  if (!userId || !igrejaId) {
    return (
      <View style={[styles.emptyContainer]}>
        <FancyText>Não foi possível carregar suas indisponibilidades.</FancyText>
      </View>
    );
  }

  if (isError) {
    return <FancyError.Default onUpdate={refetch} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {tour.showBanner && (
        <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
          <TutorialBanner onStart={tour.start} onDismiss={tour.skip} />
        </View>
      )}

      <View style={{ flex: 1, opacity: isBusy ? 0 : 1 }}>
        <FancyTabs
          keepMounted
          contentGutter={false}
          items={tabItems}
          onTabChange={setActiveTab}
        />

        <Animated.View
          style={{ opacity: fabAnim, transform: [{ scale: fabAnim }] }}
        >
          {activeTab === 0 && (
            <TutorialTarget
              id="indisponibilidade-adicionar"
              registerTarget={tour.registerTarget}
              unregisterTarget={tour.unregisterTarget}
              style={{ position: 'absolute', right: 15, bottom: 10, width: 50, height: 50 }}
              pointerEvents="box-none"
            >
              <FancyFab
                icon={{ library: 'MaterialCommunityIcons', name: 'calendar-plus', size: 26 }}
                onPress={() => setShowPeriodoModal(true)}
                bottom={0}
                right={0}
              />
            </TutorialTarget>
          )}

          {activeTab === 1 && (
            <FancyFab
              testID="fab-add-regra"
              icon={{ library: 'MaterialCommunityIcons', name: 'plus', size: 26 }}
              onPress={() => setShowRegraModal(true)}
              bottom={10}
              right={15}
            />
          )}
        </Animated.View>
      </View>

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

      {showRegraModal && (
        <AddRegraModal
          visible={showRegraModal}
          onClose={() => setShowRegraModal(false)}
          onConfirm={handleConfirmAddRegra}
        />
      )}

      {editingRegra && (
        <AddRegraModal
          visible={!!editingRegra}
          isEditing
          initialValues={{
            tipo: editingRegra.tipo,
            diasSemana: editingRegra.diasSemana ?? undefined,
            dataInicio: editingRegra.dataInicio ?? undefined,
            dataFim: editingRegra.dataFim ?? undefined,
            recorrente: editingRegra.recorrente ?? undefined,
            limiteMensal: editingRegra.limiteMensal ?? undefined,
            motivo: editingRegra.motivo ?? undefined,
          }}
          onClose={() => setEditingRegra(null)}
          onConfirm={handleConfirmEditRegra}
        />
      )}

      <TutorialOverlay tour={tour} />
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    legend: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingTop: 8,
      paddingBottom: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendCircle: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    regraChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
  });
}
