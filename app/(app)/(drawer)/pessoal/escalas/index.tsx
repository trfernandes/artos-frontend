import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyCalendar, { MarkedDate } from '../../../../../components/calendar/FancyCalendar';
import FancySeparator from '../../../../../components/FancySeparator';
import FancyList from '../../../../../components/list/FancyList';
import DateUtils from '../../../../../utils/date_utils';
import FancyCardColor from '../../../../../components/cards/Horizontal/FancyCardColor';
import { format, getMinutes } from 'date-fns';
import { EscalaResultado, EscalaResultadoStatusEnum, EscalaResultadoStatusEnumLabel } from '../../../../../domain/models/EscalaResultado';
import { Pallete } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';
import FancyText from '../../../../../components/FancyText';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyLoading from '../../../../../components/FancyLoading';
import { IconLibrary } from '../../../../../components/FancyIcons';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';
import SubstituicaoModalPage from '../../../../../components/pages/pessoal/escalas/index/SubstituicaoModalPage';
import { EscalaResultadosRepository } from '../../../../../domain/services/EscalaResultadosRepository';
import { useEscalaResultadosCrud } from '../../../../../hooks/useEscalaResultadosCrud';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import Toast from 'react-native-toast-message';
import EventoDetails from '../../../../../components/pages/pessoal/escalas/index/EventoDetails';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';

const StatusColorMap: Record<EscalaResultadoStatusEnum, string> = {
  [EscalaResultadoStatusEnum.Pendente]: Pallete.warning,
  [EscalaResultadoStatusEnum.Confirmado]: Pallete.confirm,
  [EscalaResultadoStatusEnum.Substituido]: '#2563EB',
  [EscalaResultadoStatusEnum.Ausente]: Pallete.error,
};

export default function MinhasEscalasIndexPage() {
  const { user } = useAuth();
  const [escalasDoUsuario, setEscalasDoUsuario] = useState<EscalaResultado[]>([]);
  const [isLoadingEscalas, setIsLoadingEscalas] = useState<boolean>(true);
  const { update: updateEscala, isLoadingMutation: isLoading } = useEscalaResultadosCrud();
  const { add: addSubstituicao, isLoadingMutation: isLoadingSubstituicao } = useEscalaSubstituicoesCrud();
  const [substituicaoPageParams, setSubstituicaoPageParams] = useState<({ visible: boolean } & Partial<EscalaResultado>) | undefined>({
    visible: false,
  });
  const [eventoPageParams, setEventoPageParams] = useState<{
    visible: boolean;
    data?: EscalaResultado;
  }>({
    visible: false,
  });

  const loadEscalas = useCallback(async () => {
    setIsLoadingEscalas(true);
    try {
      // const result = await EscalaResultadosRepository.getByVoluntarioId(user?.id!);
      const result = await EscalaResultadosRepository.search({
        where: {
          conditions: [
            {
              path: 'voluntario.voluntario.id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: user?.id! },
            },
          ],
        },
        relations: ['voluntario', 'evento', 'escala', 'funcao', 'voluntario.ministerio'],
      });
      setEscalasDoUsuario(result);
    } finally {
      setIsLoadingEscalas(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadEscalas();
  }, [loadEscalas]);

  const markedDates = useMemo<MarkedDate[]>(() => {
    if (!escalasDoUsuario) return [];

    const keyFrom = (item: EscalaResultado) => {
      const ministerioId = item.voluntario.ministerioId ?? item.voluntario.ministerio?.id ?? '';

      const dataISO = item.dataOcorrencia instanceof Date ? item.dataOcorrencia.toISOString() : new Date(item.dataOcorrencia).toISOString();

      const eventoId = item.evento?.id ?? '';

      return `${ministerioId}::${eventoId}::${dataISO}`;
    };

    const eventos = Array.from(
      new Map(
        escalasDoUsuario.map(item => [
          keyFrom(item),
          {
            ministerioId: item.voluntario.ministerioId ?? item.voluntario.ministerio?.id!,
            evento: item.evento,
            dataOcorrencia: item.dataOcorrencia,
          },
        ])
      ).values()
    ).sort((a, b) => {
      const timeA = a.dataOcorrencia instanceof Date ? a.dataOcorrencia.getTime() : new Date(a.dataOcorrencia).getTime();

      const timeB = b.dataOcorrencia instanceof Date ? b.dataOcorrencia.getTime() : new Date(b.dataOcorrencia).getTime();

      const diffHora = timeA - timeB;
      if (diffHora !== 0) return diffHora;

      return (a.evento?.nome ?? '').localeCompare(b.evento?.nome ?? '', 'pt-BR', { sensitivity: 'base' });
    });

    return eventos.map(escala => ({
      date: escala.dataOcorrencia instanceof Date ? escala.dataOcorrencia : new Date(escala.dataOcorrencia),
      color: escala.evento?.cor ?? '#3498db',
    }));
  }, [escalasDoUsuario]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [eventosOfSelectedDate, setEventosOfSelectedDate] = useState<EscalaResultado[]>([]);

  const handleChangeDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);

      const keyFrom = (item: EscalaResultado) => `${item.evento?.id}::${item.dataOcorrencia}`;

      const eventos = Array.from(
        new Map(
          escalasDoUsuario.filter(evento => DateUtils.equal(new Date(evento.dataOcorrencia), date)).map(item => [keyFrom(item), item])
        ).values()
      ).sort((a, b) => {
        const diffHora = getMinutes(a.dataOcorrencia) - getMinutes(b.dataOcorrencia);

        if (diffHora !== 0) {
          return diffHora;
        }

        return a.evento?.nome.localeCompare(b.evento?.nome, 'pt-BR', { sensitivity: 'base' });
      });

      setEventosOfSelectedDate(eventos);
    },
    [escalasDoUsuario, updateEscala, setSelectedDate, setEventosOfSelectedDate]
  );

  const handleConfirmEvento = useCallback(
    (eventoId: string) => {
      FancyAlert.alert('Confirmação', 'Você confirma seu serviço neste evento?', [
        {
          text: 'Não',
          style: 'destructive',
        },
        {
          text: 'Sim',
          onPress: () => {
            updateEscala({ id: eventoId, data: { status: EscalaResultadoStatusEnum.Confirmado } }).then(() => {
              setEventosOfSelectedDate(prev =>
                prev.map(item => (item.id === eventoId ? { ...item, status: EscalaResultadoStatusEnum.Confirmado } : item))
              );
            });
          },
        },
      ]);
    },
    [updateEscala]
  );

  const handleConfirmSubstituicao = useCallback(
    async (data: EscalaResultado, substitutoId: string, motivo: string) => {
      const result = await addSubstituicao({
        escalaResultadoId: data.id!,
        fromVoluntarioId: data.voluntario?.id!,
        toVoluntarioId: substitutoId,
        dataSolicitacao: new Date(),
        motivo,
      });

      if (result) {
        Toast.show({ type: 'success', text1: 'Substituição executada com sucesso.' });
        setSubstituicaoPageParams({ visible: false });

        await loadEscalas(); // atualiza o estado global
        handleChangeDate(selectedDate); // recalcula os eventos da data
      }
    },
    [addSubstituicao, loadEscalas, selectedDate, setSubstituicaoPageParams, handleChangeDate]
  );

  const handleVerDetalhes = useCallback(() => {
    console.log('ver detalhes do evento');
  }, []);

  if (isLoading || isLoadingEscalas || isLoadingSubstituicao) return <FancyLoading />;

  return (
    <FancyPageView style={styles.container}>
      <FancyCalendar
        value={selectedDate}
        markedDates={markedDates}
        onChangeSelectedDate={handleChangeDate}
        containerStyle={{ height: 300 }}
      />
      <FancySeparator style={{ paddingVertical: 5 }} />
      <View style={styles.eventsListContainer}>
        <FancyList
          bottomSpace={-10}
          ListEmptyComponent={() => <FancyListEmpty />}
          containerStyle={{ borderWidth: 0, flex: 1 }}
          data={eventosOfSelectedDate}
          renderItem={({ item, index }) => (
            <FancyCardColor
              containerStyle={{ gap: 20 }}
              contentContainerStyle={{ gap: 20 }}
              color={item.evento?.cor || Pallete.primary}
              key={index}
              title={
                <FancyText size={'small'} type="bold">
                  {item.voluntario?.ministerio?.nome}
                </FancyText>
              }
              subtitle={
                <View style={{ gap: 0, flexDirection: 'row', marginBottom: 2, marginTop: 0 }}>
                  <FancyText size={'extraSmall'} type="medium">
                    {`${item.evento?.nome} - `}
                  </FancyText>
                  <FancyText size={'extraSmall'} type="semiBold" style={{ opacity: 0.5 }}>
                    {`${format(item.dataOcorrencia, 'HH:mm')}`}
                  </FancyText>
                </View>
              }
              additionalData1={
                <View style={{ marginTop: 2, flexDirection: 'row', gap: 4 }}>
                  {item.funcao ? <FancyChips size="small" label={item.funcao?.nome} /> : undefined}

                  {item.status && (
                    <FancyChips label={EscalaResultadoStatusEnumLabel[item.status]} size="small" color={StatusColorMap[item.status]} />
                  )}
                </View>
              }
              actionButtons={[
                ...(item.status === EscalaResultadoStatusEnum.Pendente
                  ? [
                      {
                        icon: {
                          library: 'MaterialCommunityIcons' as IconLibrary,
                          name: 'check-bold',
                          size: 17,
                          style: { borderWidth: 0, marginTop: 0, marginLeft: -0.5 },
                          backgroundColor: Pallete.confirm,
                        },
                        onPress: () => {
                          if (item.id) handleConfirmEvento(item?.id);
                        },
                      },
                    ]
                  : []),

                {
                  icon: {
                    library: 'FontAwesome6',
                    name: 'repeat',
                    size: 14,
                    style: { borderWidth: 0, marginTop: -0.5 },
                    backgroundColor: Pallete.terciary,
                  },
                  onPress: () => setSubstituicaoPageParams({ visible: true, ...item }),
                },
                {
                  icon: {
                    library: 'FontAwesome',
                    name: 'info',
                    size: 17,
                    style: { borderWidth: 0, marginTop: 0, marginLeft: 1 },
                  },
                  onPress: () => {
                    setEventoPageParams({
                      visible: true,
                      data: { ...item },
                    });
                  },
                },
              ]}
            />
          )}
        />
        {substituicaoPageParams?.visible && (
          <SubstituicaoModalPage
            data={{ ...(substituicaoPageParams as EscalaResultado) }}
            onButton1Press={() => setSubstituicaoPageParams({ visible: false })}
            OnButton2Press={data =>
              data && handleConfirmSubstituicao(substituicaoPageParams as EscalaResultado, data.substitutoId, data.motivo)
            }
          />
        )}
        {eventoPageParams.visible && (
          <EventoDetails
            data={eventoPageParams.data!}
            onButton1Press={() => setEventoPageParams({ visible: false })}
            OnButton2Press={() => setEventoPageParams({ visible: false })}
          />
        )}
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 25, paddingTop: 10, gap: 6, borderWidth: 0 },
  eventsListContainer: { flex: 1 },
});
