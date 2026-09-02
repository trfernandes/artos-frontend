import { useLocalSearchParams, useNavigation } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet } from 'react-native';
import AgendaDetailsDadosTab, {
  AgendaDetailsDadosTabActions,
} from '../../../../../components/pages/ministerios/agenda/AgendaDetailsDadosTab';
import AgendaDetailsEscalaTab from '../../../../../components/pages/ministerios/agenda/AgendaDetailsEscalaTab';
import EventoSetlistTab from '../../../../../components/pages/common/EventoSetlistTab';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { ResponseEventoOcorrenciaDto } from '../../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { useAuth } from '../../../../../contexts/AuthContext';
import { EventoTipoEnum } from '../../../../../domain/enums/Evento/evento-tipo.enum';
import {
  canManageEventoOcorrencia,
  getMinisterioLoginAccess,
  ministerioEhLouvor,
} from '../../../../../utils/ministerio_permissoes';

type ExitChoice = 'cancel' | 'discard' | 'save';

export default function MinisterioAgendaDetailsPage() {
  const params = useLocalSearchParams<{
    id?: string;
    eventoId?: string;
    dataOcorrencia: string;
    ministerioId: string;
  }>();
  const navigation = useNavigation<any>();
  const { igrejaAtiva, user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const eventoId = params.eventoId || params.id || '';
  const canManageAgenda = canManageEventoOcorrencia(igrejaAtiva, params.ministerioId);
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState<ResponseEventoOcorrenciaDto | null>(null);
  const [isLoadingOcorrencia, setIsLoadingOcorrencia] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const actionsRef = useRef<AgendaDetailsDadosTabActions>({
    saveAllChanges: async () => true,
    discardUnsavedChanges: () => undefined,
  });
  const isHandlingExitRef = useRef(false);
  const ocorrenciaRequestIdRef = useRef(0);

  const { data, isLoading, buscarPorIntervalo } = useEventosCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: eventoId,
            },
          },
        ],
      },
    },
  });

  const carregarOcorrenciaAtual = useCallback(async () => {
    if (!eventoId || !params.dataOcorrencia) {
      setOcorrenciaAtual(null);
      return;
    }

    const requestId = ++ocorrenciaRequestIdRef.current;
    setIsLoadingOcorrencia(true);
    try {
      const ocorrencias = await buscarPorIntervalo({
        dataInicio: params.dataOcorrencia,
        dataTermino: params.dataOcorrencia,
        ministerioId: params.ministerioId,
      });

      if (requestId !== ocorrenciaRequestIdRef.current) return;

      const timestampSelecionado = new Date(params.dataOcorrencia).getTime();
      const selecionada =
        ocorrencias.find((item) => {
          const sameEvento = (item.eventoId || item.id) === eventoId;
          const sameData =
            item.dataOcorrencia === params.dataOcorrencia ||
            new Date(item.dataOcorrencia).getTime() === timestampSelecionado;
          return sameEvento && sameData;
        }) || null;

      setOcorrenciaAtual(selecionada);
    } catch {
      if (requestId === ocorrenciaRequestIdRef.current) setOcorrenciaAtual(null);
    } finally {
      if (requestId === ocorrenciaRequestIdRef.current) setIsLoadingOcorrencia(false);
    }
  }, [buscarPorIntervalo, eventoId, params.dataOcorrencia, params.ministerioId]);

  useEffect(() => {
    void carregarOcorrenciaAtual();
  }, [carregarOcorrenciaAtual]);

  const promptExitConfirmation = useCallback((): Promise<ExitChoice> => {
    return new Promise((resolve) => {
      FancyAlert.alert(
        'Existem alterações pendentes',
        'Você pode salvar antes de sair ou descartar o que ainda não foi salvo.',
        [
          { text: 'Cancelar', style: 'default', onPress: () => resolve('cancel') },
          { text: 'Descartar', style: 'destructive', onPress: () => resolve('discard') },
          { text: 'Salvar', onPress: () => resolve('save') },
        ],
      );
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (!hasUnsavedChanges || isHandlingExitRef.current) {
        return;
      }

      event.preventDefault();

      if (isHandlingExitRef.current) {
        return;
      }

      isHandlingExitRef.current = true;

      void (async () => {
        try {
          const choice = await promptExitConfirmation();

          if (choice === 'discard') {
            actionsRef.current.discardUnsavedChanges();
            setHasUnsavedChanges(false);
            navigation.dispatch(event.data.action);
            return;
          }

          if (choice === 'save') {
            const saved = await actionsRef.current.saveAllChanges();
            if (saved) {
              setHasUnsavedChanges(false);
              navigation.dispatch(event.data.action);
            }
          }
        } finally {
          isHandlingExitRef.current = false;
        }
      })();
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation, promptExitConfirmation]);

  // Reunião/Ensaio não têm Escala/equipe nem Setlist — só Evento do tipo Culto tem.
  const isEventoCulto = data[0]?.tipo === undefined || data[0]?.tipo === EventoTipoEnum.Culto;
  const isMinisterioLouvor = ministerioEhLouvor(
    getMinisterioLoginAccess(igrejaAtiva, params.ministerioId),
  );

  const responsavelSetlistVoluntarioId = ocorrenciaAtual?.responsavelSetlistVoluntarioId;
  const responsavelSetlistNome = ocorrenciaAtual?.responsavelSetlistVoluntario?.nome ?? undefined;
  const setlistMode: 'lider' | 'responsavel' | 'leitura' = canManageAgenda
    ? 'lider'
    : responsavelSetlistVoluntarioId && responsavelSetlistVoluntarioId === user?.user.id
      ? 'responsavel'
      : 'leitura';

  const tab_items: TabItem[] = useMemo(() => {
    const tabs: TabItem[] = [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info, size: 14 },
        content: (
          <AgendaDetailsDadosTab
            ministerioId={params.ministerioId}
            dataOcorrenciaIso={params.dataOcorrencia}
            dataOcorrenciaDate={new Date(params.dataOcorrencia)}
            ocorrencia={ocorrenciaAtual || undefined}
            evento={data[0]}
            onTemplateSaved={carregarOcorrenciaAtual}
            onUnsavedChangesChange={setHasUnsavedChanges}
            onRegisterActions={(actions) => {
              actionsRef.current = actions;
            }}
          />
        ),
      },
    ];

    if (isEventoCulto) {
      tabs.push({
        title: 'Equipe',
        icon: { ...DefaultIconsNames.group, size: 20 },
        content: (
          <AgendaDetailsEscalaTab
            eventoId={eventoId}
            dataOcorrencia={new Date(params.dataOcorrencia)}
            ministerioId={params.ministerioId}
            modo={canManageAgenda ? 'lider' : 'voluntario'}
          />
        ),
      });

      if (isMinisterioLouvor) {
        tabs.push({
          title: 'Setlist',
          icon: {
            library: 'MaterialCommunityIcons',
            name: 'playlist-music',
            size: 20,
          },
          content: (
            <EventoSetlistTab
              eventoId={eventoId}
              dataOcorrencia={new Date(params.dataOcorrencia)}
              ministerioId={params.ministerioId}
              mode={setlistMode}
              responsavelSetlistNome={ocorrenciaAtual?.responsavelSetlistVoluntario?.nome ?? null}
              detailsRoutePath='/ministerios/agenda/setlist/[itemId]'
            />
          ),
        });
      }
    }

    if (isMinisterioLouvor) {
      tabs.push({
        title: 'Setlist',
        icon: {
          library: 'MaterialCommunityIcons',
          name: 'playlist-music',
          size: 20,
          style: { marginTop: 0 },
        },
        content: (
          <EventoSetlistTab
            eventoId={eventoId}
            dataOcorrencia={new Date(params.dataOcorrencia)}
            ministerioId={params.ministerioId}
            mode={setlistMode}
            responsavelSetlistNome={responsavelSetlistNome}
            detailsRoutePath='/ministerios/agenda/setlist/[itemId]'
          />
        ),
      });
    }

    return tabs;
  }, [
    canManageAgenda,
    carregarOcorrenciaAtual,
    data,
    eventoId,
    isEventoCulto,
    isMinisterioLouvor,
    ocorrenciaAtual,
    params.dataOcorrencia,
    params.ministerioId,
    responsavelSetlistNome,
    setlistMode,
  ]);

  const isLoadingData = isLoading || isLoadingOcorrencia || !eventoId || !data[0];
  const hasLoadedOnceRef = useRef(false);
  if (!isLoadingData) hasLoadedOnceRef.current = true;
  const isInitialLoad = !hasLoadedOnceRef.current && isLoadingData;

  useEffect(() => {
    if (isLoadingData) {
      showLoading('Carregando...');
    } else {
      hideLoading();
    }
    return () => hideLoading();
  }, [isLoadingData, showLoading, hideLoading]);

  if (isInitialLoad) return null;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={tab_items} keepMounted={true} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 10 },
});
