import FancyPageView from '../../../../../components/containers/FancyPageView';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useCallback, useMemo, useRef } from 'react';
import FancyList from '../../../../../components/list/FancyList';
import FancyLoading from '../../../../../components/FancyLoading';
import Header from '../../../../../components/pages/ministerios/escalas/details/Header';
import EventoTable from '../../../../../components/pages/ministerios/escalas/details/EventoTable';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import { SubstituicaoConfirmDialog } from '../../../../../components/pages/ministerios/escalas/details/SubstituirVoluntarioModal';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { EscalaRepository } from '../../../../../domain/services/EscalaRepository';
import { useAuth } from '../../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export type EscalaItemDataType = {
  dataOcorrencia: string;
  evento: EscalaItemEventoDataType['evento'];
  equipe: EscalaItemEquipeType[];
  escalaItemId: string;
};

export type EscalaItemEventoDataType = {
  dataOcorrencia: string;
  evento: {
    id: string;
    nome: string;
    cor?: string;
    local?: string;
    dataInicio?: Date;
    dataTermino?: Date;
  };
  voluntario?: {
    minVoluntarioId: string;
    voluntarioId: string;
    nome: string;
    fotoUrl?: string;
    fotoThumbUrl?: string;
  };
  funcao?: { id: string; nome: string };
  status: EscalaItemStatusEnum;
};

export type EscalaItemEquipeType = {
  idEscalaItem: string;
  voluntario?: EscalaItemEventoDataType['voluntario'];
  funcao?: EscalaItemEventoDataType['funcao'];
  status: EscalaItemEventoDataType['status'];
};

export default function MinisterioEscalasDetailsPage() {
  const { ministerioId, escalaId, viewMode } = useLocalSearchParams<{
    ministerioId: string;
    escalaId: string;
    viewMode?: 'view' | 'edit';
  }>();
  const { igrejaAtiva } = useAuth();

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
      relations: [
        'itens',
        'itens.evento',
        'itens.voluntario',
        'itens.voluntario.voluntario',
        'itens.funcao',
      ],
    }),
    [escalaId],
  );

  const {
    data: escalaData,
    isLoading,
    isError,
    update: updateEscala,
    regenerate: regenerateEscala,
    isRegenerating,
    remove: removeEscala,
    refetch: refetchEscala,
  } = useEscalasCrud({
    autoFetch: true,
    initialParams,
  });

  const {
    update: updateEscalaItem,
    remove: removeEscalaItem,
    add: addEscalaItem,
    isError: isErrorEscalaItens,
  } = useEscalaItensCrud({
    autoFetch: false,
  });

  const startRef = useRef<number>(0);

  // Marca o início
  if (!startRef.current) startRef.current = performance.now();

  //   const {
  //     data: escalaItensData,
  //     update: updateEscalaItem,
  //     isError: isErrorEscalaItens,
  //     isLoading: isLoadingEscalaItens,
  //     isLoadingMutation: isLoadingMutationEscalaItens,
  //   } = useEscalaItensCrud({
  //     autoFetch: true,
  //     initialParams: {
  //       where: {
  //         conditions: [
  //           {
  //             path: 'escala.id',
  //             operator: Operator.EQUALS,
  //             value: { type: ValueType.LITERAL, value: escalaId },
  //           },
  //         ],
  //       },
  //       relations: ['evento', 'voluntario', 'voluntario.voluntario', 'funcao', 'itens'],
  //     },
  //   });

  //   const { update: updateEscala, remove: removeEscala } = useEscalasCrud({
  //     autoFetch: false,
  //   });

  const eventosData = useMemo(() => {
    const start = performance.now();
    const escalaItens = escalaData?.[0]?.itens ?? [];
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
          local: e.local,
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
          fotoUrl: item.voluntario?.voluntario?.fotoUrl,
          fotoThumbUrl: item.voluntario?.voluntario?.fotoThumbUrl,
        },
        funcao: {
          id: item.funcao?.id!,
          nome: item.funcao?.nome!,
        },
        status: item.status,
      });
    }

    // 🔹 Ordenação otimizada
    const gruposOrdenados = Array.from(mapa.values()) as (EscalaItemDataType & {
      _t: number;
    })[];
    for (const g of gruposOrdenados) g._t = new Date(g.dataOcorrencia).getTime();

    gruposOrdenados.sort((a, b) => {
      if (a._t !== b._t) return a._t - b._t;
      return a.evento.nome < b.evento.nome ? -1 : a.evento.nome > b.evento.nome ? 1 : 0;
    });

    // 🔹 Ordenar equipe internamente
    for (const grupo of gruposOrdenados) {
      grupo.equipe.sort((a, b) => {
        const funcaoA = a.funcao?.nome ?? '';
        const funcaoB = b.funcao?.nome ?? '';

        if (funcaoA < funcaoB) return -1;
        if (funcaoA > funcaoB) return 1;

        const voluntarioA = a.voluntario?.minVoluntarioId ?? '';
        const voluntarioB = b.voluntario?.minVoluntarioId ?? '';
        return voluntarioA.localeCompare(voluntarioB);
      });
    }

    const end = performance.now();
    console.log(`⏱️ Tempo de processamento dos resultados: ${end - start} ms`);

    return gruposOrdenados;
  }, [escalaData?.[0]?.itens]);

  const handleSubstituirVoluntario = useCallback(
    async (data: SubstituicaoConfirmDialog): Promise<boolean> => {
      try {
        await updateEscalaItem?.({
          id: data.idEscalaItem,
          data: {
            voluntarioId: data.idSubstituto,
          },
        });
        await refetchEscala();
        return true;
      } catch {
        return false;
      }
    },
    [updateEscalaItem, refetchEscala],
  );

  const handleAdicionarVoluntario = useCallback(
    async (data: { idEscalaItem: string; idVoluntario: string }): Promise<boolean> => {
      try {
        await updateEscalaItem?.({
          id: data.idEscalaItem,
          data: {
            voluntarioId: data.idVoluntario,
          },
        });
        await refetchEscala();
        return true;
      } catch {
        return false;
      }
    },
    [updateEscalaItem, refetchEscala],
  );

  const handleDeleteEvento = useCallback(
    async (eventoId: string, dataOcorrencia: string): Promise<boolean> => {
      try {
        if (!igrejaAtiva?.id) return false;
        await EscalaRepository.deleteItensByEvento(escalaId, igrejaAtiva.id, {
          eventoId,
          dataOcorrencia,
        });
        await refetchEscala();
        Toast.show({
          type: 'success',
          text1: 'Evento removido com sucesso.',
        });
        return true;
      } catch {
        return false;
      }
    },
    [escalaId, refetchEscala, igrejaAtiva?.id],
  );

  const handleAdicionarFuncao = useCallback(
    async (data: {
      funcaoId: string;
      eventoId: string;
      dataOcorrencia: string;
    }): Promise<boolean> => {
      try {
        await addEscalaItem?.({
          escalaId: escalaId,
          eventoId: data.eventoId,
          dataOcorrencia: data.dataOcorrencia,
          funcaoId: data.funcaoId,
        });
        await refetchEscala();
        return true;
      } catch {
        return false;
      }
    },
    [addEscalaItem, escalaId, refetchEscala],
  );

  const handleExcluirFuncao = useCallback(
    async (funcaoId: string, eventoId: string, dataOcorrencia: string): Promise<void> => {
      try {
        // Buscar todos os itens da escala com esta função, evento e data
        const itensToRemove = escalaData?.[0]?.itens?.filter(
          (item) =>
            item.funcao?.id === funcaoId &&
            item.evento?.id === eventoId &&
            item.dataOcorrencia === dataOcorrencia,
        );

        if (itensToRemove && itensToRemove.length > 0) {
          // Remover todos os itens dessa função
          await Promise.all(itensToRemove.map((item) => removeEscalaItem?.(item.id!)));
          await refetchEscala();
        }
      } catch (error) {
        console.error('Erro ao excluir função:', error);
      }
    },
    [escalaData, removeEscalaItem, refetchEscala],
  );

  const handlePublishPress = useCallback(() => {
    FancyAlert.alert('Publicação de escala', 'Deseja realmente publicar esta escala?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          await updateEscala?.({
            id: escalaId,
            data: {
              status: EscalaStatusEnum.Publicada,
            },
          });
        },
      },
    ]);
  }, [escalaId, updateEscala]);

  const handleGeneratePress = useCallback(() => {
    const escala = escalaData?.[0];
    if (!escala) return;

    if (isRegenerating) {
      return;
    }

    if (escala.status !== EscalaStatusEnum.Gerada) {
      FancyAlert.alert(
        'Regerar escala',
        'Só é possível regerar escalas com status Gerada. Para escalas publicadas, crie/edite uma nova versão.',
        [{ text: 'OK', style: 'cancel' }],
      );
      return;
    }

    FancyAlert.alert(
      'Regerar Escala',
      'Isso vai recalcular a escala com os dados atuais e substituir os itens existentes. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regerar',
          style: 'destructive',
          onPress: async () => {
            try {
              await regenerateEscala?.(escalaId);
              await refetchEscala();
              Toast.show({
                type: 'success',
                text1: 'Escala regerada com sucesso!',
              });
            } catch (error) {
              console.log('Erro ao regerar escala:', error);
            }
          },
        },
      ],
    );
  }, [escalaData, escalaId, isRegenerating, regenerateEscala, refetchEscala]);

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

  if (isError || isErrorEscalaItens) {
    console.log('Erro ao carregar dados da escala:', isError ? 'isError' : 'isErrorEscalaItens');
    return (
      <FancyScreenErrorHandler
        error={{ name: 'Erro', message: 'Erro ao carregar os dados da escala.' }}
      />
    );
  }

  if (isLoading || !escalaData?.[0]) {
    return <FancyLoading />;
  }

  return (
    <FancyPageView style={styles.container}>
      <Header
        escala={escalaData?.[0]}
        viewMode={viewMode}
        onPublishPress={handlePublishPress}
        onGeneratePress={handleGeneratePress}
        onDeletePress={handleDeletePress}
      />
      {eventosData && (
        <FancyList
          keyExtractor={(item) => item.evento?.id + item.dataOcorrencia.toString()}
          data={eventosData}
          listEmptyProps={{
            label: 'Nenhum evento nesta escala',
            icon: { library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 68 },
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 14,
            paddingBottom: 30,
          }}
          containerStyle={{ flex: 1 }}
          renderItem={({ item }) => (
            <EventoTable
              data={item}
              viewMode={viewMode}
              ministerioId={ministerioId}
              escalaId={escalaId}
              onChangeVoluntario={async (data) => {
                return await handleSubstituirVoluntario(data);
              }}
              onAddVoluntario={async (data) => {
                return await handleAdicionarVoluntario(data);
              }}
              onDeleteEvento={async (eventoId, dataOcorrencia) => {
                return await handleDeleteEvento(eventoId, dataOcorrencia);
              }}
              onAdicionarFuncao={async (data) => {
                return await handleAdicionarFuncao(data);
              }}
              onExcluirFuncao={async (funcaoId, eventoId, dataOcorrencia) => {
                await handleExcluirFuncao(funcaoId, eventoId, dataOcorrencia);
              }}
            />
          )}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
});
