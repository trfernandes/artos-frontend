import { StyleSheet } from 'react-native';

import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EscalaEventoEquipeTab from '../../../../../components/pages/pessoal/escalas/evento/EscalaEventoEquipeTab';
import EscalaEventoInformationTab from '../../../../../components/pages/pessoal/escalas/evento/EscalaEventoInformationTab';
import EscalaEventoSetlistTab from '../../../../../components/pages/pessoal/escalas/evento/EscalaEventoSetlistTab';

const TABS_DATA: TabItem[] = [
  { title: 'Dados', icon: { ...DefaultIconsNames.info }, content: <EscalaEventoInformationTab /> },
  {
    title: 'Equipe',
    icon: { ...DefaultIconsNames.group, size: 20, style: { marginTop: 0 } },
    content: <EscalaEventoEquipeTab />,
  },
  { title: 'Setlist', icon: { library: 'Fontisto', name: 'play-list', size: 12 }, content: <EscalaEventoSetlistTab /> },
];

export default function EscalaEventoPage() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: `Culto de Domingo`,
    });
  }, []);

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TABS_DATA}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flex: 1, paddingHorizontal: 20 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, gap: 6, borderWidth: 0, borderColor: 'forestgreen' },
});
