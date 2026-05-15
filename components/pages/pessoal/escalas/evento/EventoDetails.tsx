import { StyleSheet } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import EscalaEventoEquipeTab from './EscalaEventoEquipeTab';
import FancyPageView from '../../../../containers/FancyPageView';
import { useMemo } from 'react';
import { usePallete } from '../../../../../hooks/usePallete';
import EventoInfoCard from '../../../common/EventoInfoCard';
import { ResponseEventoDto } from '../../../../../domain/dtos/Evento/evento.response';
import EventoSetlistTab from '../../../common/EventoSetlistTab';
import { useAuth } from '../../../../../contexts/AuthContext';
import { isLouvorMinisterioTipo } from '../../../../../utils/evento-ensaio';

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
  const isLouvorMinisterio = useMemo(
    () =>
      igrejaAtiva?.ministerios?.some(
        (ministerio) => ministerio.id === props.ministerioId && isLouvorMinisterioTipo(ministerio.tipo),
      ) ?? false,
    [igrejaAtiva?.ministerios, props.ministerioId],
  );
  const isSetlistResponsavel =
    isLouvorMinisterio &&
    !!props.responsavelSetlistVoluntarioId &&
    props.responsavelSetlistVoluntarioId === user?.user?.id;

  const TABS_DATA: TabItem[] = useMemo(() => {
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

    if (isLouvorMinisterio) {
      tabs.push({
        title: 'SetList',
        icon: { library: 'MaterialCommunityIcons', name: 'playlist-music-outline', size: 18 },
        content: (
          <EventoSetlistTab
            eventoId={props.evento.id!}
            dataOcorrencia={props.dataOcorrencia}
            ministerioId={props.ministerioId}
            mode={isSetlistResponsavel ? 'responsavel' : 'leitura'}
            responsavelSetlistNome={props.responsavelSetlistNome ?? null}
            detailsRoutePath='/pessoal/escalas/setlist/[itemId]'
          />
        ),
      });
    }

    return tabs;
  }, [isLouvorMinisterio, isSetlistResponsavel, props.dataOcorrencia, props.evento, props.horarioEnsaio, props.ministerioId, props.ministerioNome, props.responsavelSetlistNome]);

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TABS_DATA}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, paddingBottom: 20, borderWidth: 0, borderColor: 'forestgreen' },
});
