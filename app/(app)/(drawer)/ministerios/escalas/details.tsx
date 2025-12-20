import FancyPageView from '../../../../../components/containers/FancyPageView';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import FancySeparator from '../../../../../components/FancySeparator';
import { useCallback, useMemo, useRef } from 'react';
import FancyList from '../../../../../components/list/FancyList';
import { EscalaItemStatusEnum } from '../../../../../domain/models/EscalaItem';
import FancyLoading from '../../../../../components/FancyLoading';
import Header from '../../../../../components/pages/ministerios/escalas/details/Header';
import EventoTable from '../../../../../components/pages/ministerios/escalas/details/EventoTable';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import { SubstituicaoConfirmDialog } from '../../../../../components/pages/ministerios/escalas/details/SubstituirVoluntarioModal';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { EscalaStatusEnum } from '../../../../../domain/models/Escala';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';

export type EscalaItemDataType = {
  dataOcorrencia: Date;
  evento: EscalaItemEventoDataType['evento'];
  equipe: EscalItemEquipeType[];
  escalaItemId: string;
};

export type EscalaItemEventoDataType = {
  dataOcorrencia: string;
  evento: { id: string; nome: string; cor?: string; dataInicio?: Date; dataTermino?: Date };
  voluntario: { minVoluntarioId: string; voluntarioId: string; nome: string; foto: string };
  funcao: { id: string; nome: string };
  status: EscalaItemStatusEnum;
};

export type EscalItemEquipeType = {
  idEscalaItem: string;
  voluntario: EscalaItemEventoDataType['voluntario'];
  funcao: EscalaItemEventoDataType['funcao'];
  status: EscalaItemEventoDataType['status'];
};

export default function MinisterioEscalasDetailsPage() {
  const { ministerioId, escalaId, viewMode } = useLocalSearchParams<{
    ministerioId: string;
    escalaId: string;
    viewMode?: 'view' | 'edit';
  }>();

  const initialParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: escalaId },
          },
        ],
      },
    }),
    [escalaId]
  );

  const { data: escalaData, isLoading } = useEscalasCrud({ autoFetch: true, initialParams });

  const startRef = useRef<number>(0);

  // Marca o início
  if (!startRef.current) startRef.current = performance.now();

  const {
    data: escalaItensData,
    update: updateEscalaItem,
    isLoading: isLoadingEscalaItens,
    isLoadingMutation: isLoadingMutationEscalaItens,
  } = useEscalaItensCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'escala.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: escalaId },
          },
        ],
      },
      relations: ['evento', 'voluntario', 'voluntario.voluntario', 'funcao'],
    },
  });

  const { update: updateEscala, remove: removeEscala } = useEscalasCrud({ autoFetch: false });

  const eventosData = useMemo(() => {
    const start = performance.now();
    const escalaItens = escalaItensData ?? [];
    if (escalaItens.length === 0) return [];

    const mapa = new Map<string, EscalaItemDataType>();
    const cacheEventos = new Map<string, EscalaItemDataType['evento']>();

    // 🔹 Função auxiliar para mapear e cachear eventos
    const mapEvento = (e: any): EscalaItemDataType['evento'] => {
      if (!cacheEventos.has(e?.id)) {
        cacheEventos.set(e?.id, {
          id: e?.id!,
          nome: e.nome,
          cor: e.cor,
          dataInicio: e.dataInicio,
          dataTermino: e.dataTermino,
        });
      }
      return cacheEventos.get(e?.id)!;
    };

    // 🔹 Agrupamento otimizado
    for (let i = 0; i < escalaItens.length; i++) {
      const item = escalaItens[i];
      const chave = `${item.dataOcorrencia}-${item.evento?.id}`;

      let grupo = mapa.get(chave);
      if (!grupo) {
        grupo = {
          dataOcorrencia: item.dataOcorrencia,
          evento: mapEvento(item.evento),
          equipe: [],
          escalaItemId: item.id!,
        } as EscalaItemDataType;
        mapa.set(chave, grupo);
      }

      grupo.equipe.push({
        idEscalaItem: item?.id!,
        voluntario: {
          minVoluntarioId: item.voluntario?.id!,
          voluntarioId: item.voluntario?.voluntario?.id!,
          nome: item.voluntario?.voluntario?.nome!,
          foto: item.voluntario?.voluntario?.foto || '',
        },
        funcao: { id: item.funcao?.id!, nome: item.funcao.nome },
        status: item.status,
      });
    }

    // 🔹 Ordenação otimizada
    const gruposOrdenados = Array.from(mapa.values()) as (EscalaItemDataType & { _t: number })[];
    for (const g of gruposOrdenados) g._t = new Date(g.dataOcorrencia).getTime();

    gruposOrdenados.sort((a, b) => {
      if (a._t !== b._t) return a._t - b._t;
      return a.evento.nome < b.evento.nome ? -1 : a.evento.nome > b.evento.nome ? 1 : 0;
    });

    // 🔹 Ordenar equipe internamente
    for (const grupo of gruposOrdenados) {
      grupo.equipe.sort((a, b) => {
        if (a.funcao.nome < b.funcao.nome) return -1;
        if (a.funcao.nome > b.funcao.nome) return 1;
        return a.voluntario.minVoluntarioId.localeCompare(b.voluntario.minVoluntarioId);
      });
    }

    const end = performance.now();
    console.log(`⏱️ Tempo de processamento dos resultados: ${end - start} ms`);

    return gruposOrdenados;
  }, [JSON.stringify(escalaItensData)]);

  const handleSubstituirVoluntario = useCallback(
    async (data: SubstituicaoConfirmDialog): Promise<boolean> => {
      try {
        await updateEscalaItem({
          id: data.idEscalaItem,
          data: {
            voluntario: { id: data.idSubstituto } as any,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
    [updateEscalaItem]
  );

  const handlePublishPress = useCallback(() => {
    FancyAlert.alert('Publicação de escala', 'Deseja realmente publicar esta escala?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          await updateEscala({
            id: escalaId,
            data: {
              status: EscalaStatusEnum.Publicada,
            },
          });
        },
      },
    ]);
  }, []);

  const handleGeneratePress = useCallback(() => {}, []);

  const handleDeletePress = useCallback(() => {
    FancyAlert.alert('Exclusão de escala', 'Deseja realmente excluir esta escala?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          await removeEscala(escalaId);
          router.back();
        },
      },
    ]);
  }, [escalaId, removeEscala, router]);

  const handleFinishPress = useCallback(() => {
    FancyAlert.alert('Alterar status da escala', 'Deseja realmente "Concluir" esta escala?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          await updateEscala({
            id: escalaId,
            data: {
              status: EscalaStatusEnum.Concluida,
            },
          });
        },
      },
    ]);
  }, [escalaId, removeEscala, router]);

  if (isLoading || isLoadingEscalaItens || isLoadingMutationEscalaItens) {
    return <FancyLoading />;
  } else {
    const tempo = performance.now() - startRef.current!;
    console.log(`⏱️ Tempo de renderização da tela: ${tempo} ms`);
  }

  return (
    <FancyPageView style={styles.container}>
      <Header
        escala={escalaData?.[0]}
        viewMode={viewMode}
        onPublishPress={handlePublishPress}
        onFinishPress={handleFinishPress}
        onGeneratePress={handleGeneratePress}
        onDeletePress={handleDeletePress}
      />
      <FancySeparator />
      {eventosData && (
        <FancyList
          keyExtractor={item => item.evento?.id + item.dataOcorrencia.toString()}
          data={eventosData}
          contentContainerStyle={{ paddingHorizontal: 15, gap: 10, paddingBottom: 30 }}
          containerStyle={{ flex: 1 }}
          renderItem={({ item }) => (
            <EventoTable
              data={item}
              viewMode={viewMode}
              ministerioId={ministerioId}
              onChangeVoluntario={async data => {
                return await handleSubstituirVoluntario(data);
              }}
            />
          )}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, gap: 15 },
});
