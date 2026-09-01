import { StyleSheet } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import EscalaEventoEquipeTab from './EscalaEventoEquipeTab';
import FancyPageView from '../../../../containers/FancyPageView';
import { useMemo } from 'react';
import { usePallete } from '../../../../../hooks/usePallete';
import EventoInfoCard from '../../../common/EventoInfoCard';
import EventoSetlistTab from '../../../common/EventoSetlistTab';
import { ResponseEventoDto } from '../../../../../domain/dtos/Evento/evento.response';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  canManageEventoOcorrencia,
  getMinisterioLoginAccess,
  ministerioEhLouvor,
} from '../../../../../utils/ministerio_permissoes';

export default function EventoDetails(props: {
  evento: ResponseEventoDto;
  dataOcorrencia: Date;
  horarioEnsaio?: string;
  ministerioNome?: string;
  ministerioId?: string;
  responsavelSetlistVoluntarioId?: string;
  responsavelSetlistNome?: string;
}) {
  const Pallete = usePallete();
  const { igrejaAtiva, user } = useAuth();

  const TABS_DATA: TabItem[] = useMemo(() => {
    const ministerio = getMinisterioLoginAccess(igrejaAtiva, props.ministerioId);
    const isMinisterioLouvor = ministerioEhLouvor(ministerio);
    const setlistMode: 'lider' | 'responsavel' | 'leitura' = canManageEventoOcorrencia(
      igrejaAtiva,
      props.ministerioId,
    )
      ? 'lider'
      : props.responsavelSetlistVoluntarioId && props.responsavelSetlistVoluntarioId === user?.user.id
        ? 'responsavel'
        : 'leitura';

    const tabs: TabItem[] = [
      {
        title: 'Dados',
        icon: { ...DefaultIconsNames.info },
        content: (
          <EventoInfoCard
            eventoCor={props.evento.cor || Pallete.primary}
            eventoNome={props.evento.nome}
            dataOcorrencia={props.dataOcorrencia}
            local={props.evento.local}
            descricao={props.evento.descricao}
            horarioEnsaio={props.horarioEnsaio}
            ministerioNome={props.ministerioNome}
          />
        ),
      },
      {
        title: 'Equipe',
        icon: { ...DefaultIconsNames.group, size: 20, style: { marginTop: 0 } },
        content: (
          <EscalaEventoEquipeTab
            eventoId={props.evento.id!}
            dataOcorrencia={props.dataOcorrencia}
            ministerioId={props.ministerioId}
            responsavelSetlistVoluntarioId={props.responsavelSetlistVoluntarioId}
            responsavelSetlistNome={props.responsavelSetlistNome}
          />
        ),
      },
    ];

    if (isMinisterioLouvor) {
      tabs.push({
        title: 'Setlist',
        icon: { library: 'MaterialCommunityIcons', name: 'playlist-music', size: 20, style: { marginTop: 0 } },
        content: (
          <EventoSetlistTab
            eventoId={props.evento.id!}
            dataOcorrencia={props.dataOcorrencia}
            ministerioId={props.ministerioId}
            mode={setlistMode}
            responsavelSetlistNome={props.responsavelSetlistNome}
            detailsRoutePath='/pessoal/escalas/setlist/[itemId]'
          />
        ),
      });
    }

    return tabs;
  }, [
    igrejaAtiva,
    user,
    props.dataOcorrencia,
    props.evento,
    props.horarioEnsaio,
    props.ministerioId,
    props.ministerioNome,
    props.responsavelSetlistNome,
    props.responsavelSetlistVoluntarioId,
  ]);

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={TABS_DATA} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, paddingBottom: 20, borderWidth: 0, borderColor: 'forestgreen' },
});
