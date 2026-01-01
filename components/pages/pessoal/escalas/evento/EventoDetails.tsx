import { StyleSheet } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import EscalaEventoEquipeTab from './EscalaEventoEquipeTab';
import FancyPageView from '../../../../containers/FancyPageView';
import { useMemo } from 'react';
import { EventoModel } from '../../../../../domain/models/Evento';
import { Pallete } from '../../../../../constants/colors';
import EventoInfoCard from '../../../common/EventoInfoCard';

export default function EventoDetails(props: { evento: EventoModel; dataOcorrencia: Date }) {
  const TABS_DATA: TabItem[] = useMemo(
    () => [
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
          />
        ),
      },
      {
        title: 'Equipe',
        icon: { ...DefaultIconsNames.group, size: 20, style: { marginTop: 0 } },
        content: <EscalaEventoEquipeTab eventoId={props.evento.id!} dataOcorrencia={props.dataOcorrencia} />,
      },
      // {
      //   title: 'Setlist',
      //   icon: { library: 'Fontisto', name: 'play-list', size: 12 },
      //   content: <EscalaEventoSetlistTab />,
      // },
    ],
    []
  );

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
  container: { paddingTop: 10, gap: 6, borderWidth: 0, borderColor: 'forestgreen' },
});
