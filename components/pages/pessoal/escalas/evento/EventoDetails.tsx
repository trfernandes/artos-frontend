import { StyleSheet } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import EscalaEventoEquipeTab from './EscalaEventoEquipeTab';
import FancyPageView from '../../../../containers/FancyPageView';
import { useMemo } from 'react';
import { Pallete } from '../../../../../constants/colors';
import EventoInfoCard from '../../../common/EventoInfoCard';
import { ResponseEventoDto } from '../../../../../domain/dtos/Evento/evento.response';
import EventoSetlistTab from '../../../common/EventoSetlistTab';
import { useAuth } from '../../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../../domain/enums/Igreja/voluntario-role.enum';
import { MinisterioTipoEnum } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';

export default function EventoDetails(props: {
  evento: ResponseEventoDto;
  dataOcorrencia: Date;
  horarioEnsaio?: string;
  ministerioNome?: string;
  ministerioId?: string;
  responsavelSetlistVoluntarioId?: string;
}) {
  const { igrejaAtiva, user } = useAuth();
  const isLouvorMinisterio = useMemo(
    () => igrejaAtiva?.ministerios?.some((ministerio) => ministerio.id === props.ministerioId && ministerio.tipo === MinisterioTipoEnum.Louvor) ?? false,
    [igrejaAtiva?.ministerios, props.ministerioId],
  );
  const canEditSetlist =
    isLouvorMinisterio &&
    (igrejaAtiva?.role === IgrejaVoluntarioRoleEnum.ADMIN ||
      igrejaAtiva?.role === IgrejaVoluntarioRoleEnum.LIDER ||
      props.responsavelSetlistVoluntarioId === user?.user?.id);

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
            mode={canEditSetlist ? 'responsavel' : 'leitura'}
          />
        ),
      });
    }

    return tabs;
  }, [canEditSetlist, isLouvorMinisterio, props.dataOcorrencia, props.evento, props.horarioEnsaio, props.ministerioId, props.ministerioNome]);

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TABS_DATA}
        containerStyle={{ flex: 1 }}
        headerStyle={{ paddingHorizontal: 20 }}
        contentContainerStyle={{ flex: 1, paddingHorizontal: 20 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, paddingBottom: 20, borderWidth: 0, borderColor: 'forestgreen' },
});
