import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySegmentedControl from '../../../../../components/fields/FancySegmentedControl';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyList from '../../../../../components/list/FancyList';
import { FancyListEmptyProps } from '../../../../../components/list/FancyListEmpty';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import {
  EscalaSubstituicaoStatusEnum,
} from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import SubstituicaoMinisterioCard from '../../../../../components/pages/ministerios/escalas/substituicoes/SubstituicaoMinisterioCard';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';

type TabValue = 'pendentes' | 'respondidas' | 'todas';

const EMPTY_STATE_PROPS: Record<TabValue, FancyListEmptyProps> = {
  pendentes: {
    label: 'Tudo em dia!',
    helperText: 'Não há solicitações pendentes no ministério.',
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
    helperText: 'Nenhuma solicitação de substituição no ministério.',
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

export default function MinisterioSubstituicoesScreen() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva } = useAuth();
  const [tab, setTab] = useState<TabValue>('pendentes');
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const query: DynamicQuery = useMemo(
    () => ({
      where: {
        conditions: [
          {
            path: 'escalaItem.escala.ministerioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId ?? '' },
          },
        ],
      },
      relations: RELATIONS,
    }),
    [ministerioId],
  );

  const {
    data,
    isLoading,
    update,
    isLoadingMutation,
  } = useEscalaSubstituicoesCrud({ autoFetch: true, initialParams: query });

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (tab === 'pendentes')
      return list.filter((s) => s.status === EscalaSubstituicaoStatusEnum.Pendente);
    if (tab === 'respondidas')
      return list.filter(
        (s) =>
          s.status === EscalaSubstituicaoStatusEnum.Aprovada ||
          s.status === EscalaSubstituicaoStatusEnum.Recusada,
      );
    return list;
  }, [data, tab]);

  const pendentesCount = useMemo(
    () => (data ?? []).filter((s) => s.status === EscalaSubstituicaoStatusEnum.Pendente).length,
    [data],
  );

  const handleCancelar = async (id: string, motivo?: string) => {
    setCancelingId(id);
    try {
      await update?.({
        id,
        data: {
          status: EscalaSubstituicaoStatusEnum.Cancelada,
          motivoCancelamento: motivo,
        },
      });
      Toast.show({ type: 'success', text1: 'Substituição cancelada.', position: 'top' });
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) ?? 'Erro ao cancelar.', position: 'top' });
    } finally {
      setCancelingId(null);
    }
  };

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

      {isLoading || isLoadingMutation ? (
        <FancyLoading />
      ) : (
        <FancyList
          containerStyle={styles.listContainer}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item: sub }) => (
            <SubstituicaoMinisterioCard
              substituicao={sub}
              onCancelar={handleCancelar}
              isCanceling={cancelingId === sub.id}
            />
          )}
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
