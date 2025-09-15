import { StyleSheet, View } from 'react-native';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EventosDadosForm from '../../../../../components/pages/admin/eventos/EventosDadosForm';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyButton from '../../../../../components/buttons/FancyButton';
import EventosEscalaForm from '../../../../../components/pages/admin/eventos/EventosEscalaForm';
import EventosSetListForm from '../../../../../components/pages/admin/eventos/EventosSetListForm';

const TABS: TabItem[] = [
  {
    title: 'Dados',
    icon: { library: DefaultIconsNames.info.library, name: DefaultIconsNames.info.name },
    content: <EventosDadosForm />,
  },
  {
    title: 'Escala',
    icon: {
      library: DefaultIconsNames['calendar-month'].library,
      name: DefaultIconsNames['calendar-month'].name,
    },
    content: <EventosEscalaForm />,
  },
  {
    title: 'SetList',
    icon: { library: 'Fontisto', name: 'play-list', size: 12 },
    content: <EventosSetListForm />,
  },
];

export default function EventosEditPage() {
  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TABS}
        containerStyle={styles.tabsContainer}
        contentContainerStyle={{ flex: 1, paddingHorizontal: 20, paddingVertical: 5 }}
      />
      <View style={styles.buttons}>
        <FancyButton
          label="Salvar"
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          type="contained"
        />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderWidth: 0, borderColor: 'lightgreen', paddingVertical: 15, gap: 15 },
  fields: {
    gap: 15,
    paddingVertical: 5,
    borderWidth: 0,
    borderColor: 'red',
  },
  buttons: { paddingHorizontal: 18 },
  tabsContainer: { flex: 1 },
});
