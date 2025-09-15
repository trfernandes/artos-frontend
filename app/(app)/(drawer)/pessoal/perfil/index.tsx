import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import DadosTab from '../../../../../components/pages/pessoal/perfil/DadosTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import MinisteriosTab from '../../../../../components/pages/pessoal/perfil/MinisteriosTab';

const TAB_DATA: TabItem[] = [
  { title: 'Dados', icon: { ...DefaultIconsNames.info, size: 16 }, content: <DadosTab /> },
  { title: 'Ministérios', icon: { library: 'Feather', name: 'grid', size: 14 }, content: <MinisteriosTab /> },
];

export default function PerfilIndexPage() {
  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_DATA}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flex: 1, paddingTop: 0, paddingHorizontal: 20 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10 },
});
