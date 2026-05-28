import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySegmentedControl from '../../../../../components/fields/FancySegmentedControl';
import FancyText from '../../../../../components/FancyText';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyList from '../../../../../components/list/FancyList';
import FancyListEmpty, { FancyListEmptyProps } from '../../../../../components/list/FancyListEmpty';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import SubstituicaoRecebidaCard from '../../../../../components/pages/pessoal/escalas/substituicoes/SubstituicaoRecebidaCard';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';

type TabValue = 'pendentes' | 'respondidas' | 'todas';

const EMPTY_STATE_PROPS: Record<TabValue, FancyListEmptyProps> = {
  pendentes: {
    label: 'Tudo em dia!',
    helperText: 'Você não tem solicitações pendentes no momento.',
    icon: { library: 'MaterialCommunityIcons', name: 'check-circle-outline', size: 55 },
    muted: false,
  },
  respondidas: {
    label: 'Sem histórico ainda',
    helperText: 'Solicitações respondidas aparecerão aqui.',
    icon: { library: 'MaterialCommunityIcons', name: 'clipboard-check-outline', size: 55 },
    muted: false,
  },
  todas: {
    label: 'Sem solicitações',
    helperText: 'Suas substituições enviadas e recebidas aparecerão aqui.',
    icon: { library: 'MaterialCommunityIcons', name: 'clipboard-list-outline', size: 55 },
    muted: false,
  },
};

const RELATIONS = [
  'escalaItem',
  'escalaItem.evento',
  'escalaItem.funcao',
  'solicitante',
  'solicitante.voluntario',
  'substituto',
  'substituto.voluntario',
];

export default function SubstituicoesScreen() {
  const { user } = useAuth();
  const palette = usePallete();
  const [tab, setTab] = useState<TabValue>('pendentes');

  const queryAsSubstituto = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'substituto.voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: user?.user?.id ?? '' },
          },
        ],
      },
      relations: RELATIONS,
    }),
    [user?.user?.id],
  );

  const queryAsSolicitante = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'solicitante.voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: user?.user?.id ?? '' },
          },
        ],
      },
      relations: RELATIONS,
    }),
    [user?.user?.id],
  );

  const {
    data: dataAsSubstituto,
    isLoading: isLoadingSubstituto,
    update,
    isLoadingMutation,
    refetch: refetchSubstituto,
    isRefetching: isRefetchingSubstituto,
  } = useEscalaSubstituicoesCrud({ autoFetch: true, initialParams: queryAsSubstituto });

  const { data: dataAsSolicitante, isLoading: isLoadingSolicitante, refetch: refetchSolicitante, isRefetching: isRefetchingSolicitante } =
    useEscalaSubstituicoesCrud({ autoFetch: true, initialParams: queryAsSolicitante });

  const handleRefresh = useCallback(() => {
    refetchSubstituto();
    refetchSolicitante();
  }, [refetchSubstituto, refetchSolicitante]);
  const isRefreshing = isRefetchingSubstituto || isRefetchingSolicitante;

  const allData = useMemo<ResponseEscalaSubstituicaoDto[]>(() => {
    const seen = new Set<string>();
    const merged = [...(dataAsSubstituto ?? []), ...(dataAsSolicitante ?? [])];
    return merged.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [dataAsSubstituto, dataAsSolicitante]);

  const filtered = useMemo(() => {
    if (tab === 'pendentes')
      return allData.filter((s) => s.status === EscalaSubstituicaoStatusEnum.Pendente);
    if (tab === 'respondidas')
      return allData.filter((s) => s.status !== EscalaSubstituicaoStatusEnum.Pendente);
    return allData;
  }, [allData, tab]);

  const pendentesCount = useMemo(
    () => allData.filter((s) => s.status === EscalaSubstituicaoStatusEnum.Pendente).length,
    [allData],
  );

  const [actingId, setActingId] = useState<string | null>(null);

  const handleRespond = async (
    id: string,
    status: EscalaSubstituicaoStatusEnum,
    motivo?: string,
  ) => {
    setActingId(id);
    try {
      await update?.({
        id,
        data: {
          status,
          dataResposta: new Date().toISOString(),
          ...(motivo ? { motivoCancelamento: motivo } : {}),
        },
      });
      Toast.show({
        type: 'success',
        text1:
          status === EscalaSubstituicaoStatusEnum.Aprovada
            ? 'Substituição aprovada!'
            : 'Substituição recusada.',
        position: 'top',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: getApiErrorMessage(err) ?? 'Erro ao responder.',
        position: 'top',
      });
    } finally {
      setActingId(null);
    }
  };

  const handleAceitar = (id: string) => handleRespond(id, EscalaSubstituicaoStatusEnum.Aprovada);
  const handleRecusarComMotivo = (id: string, motivo: string) =>
    handleRespond(id, EscalaSubstituicaoStatusEnum.Recusada, motivo);
  const handleCancelarComMotivo = (id: string, motivo: string) =>
    handleRespond(id, EscalaSubstituicaoStatusEnum.Cancelada, motivo);

  const isLoading = isLoadingSubstituto || isLoadingSolicitante || isLoadingMutation;

  return (
    <FancyPageView style={styles.page}>
      <FancySegmentedControl<TabValue>
        options={[
          {
            label: pendentesCount > 0 ? `Pendentes (${pendentesCount})` : 'Pendentes',
            value: 'pendentes',
          },
          { label: 'Respondidas', value: 'respondidas' },
          { label: 'Todas', value: 'todas' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <FancyLoading />
      ) : (
        <FancyList
          containerStyle={styles.listContainer}
          data={filtered}
          keyExtractor={(item) => item.id}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          renderItem={({ item: sub }) => {
            const isSubstituto = sub.substituto?.voluntario?.id === user?.user?.id;
            const isSolicitante = sub.solicitante?.voluntario?.id === user?.user?.id;
            const isPendente = sub.status === EscalaSubstituicaoStatusEnum.Pendente;
            const canAct = isSubstituto && isPendente;
            return (
              <SubstituicaoRecebidaCard
                substituicao={sub}
                canAct={canAct}
                onAceitar={canAct ? handleAceitar : undefined}
                onRecusar={canAct ? handleRecusarComMotivo : undefined}
                isActing={actingId === sub.id}
                isSolicitante={isSolicitante}
                onCancelar={isSolicitante ? handleCancelarComMotivo : undefined}
              />
            );
          }}
          listEmptyProps={EMPTY_STATE_PROPS[tab]}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
});
