import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import FancyDrawerHeader from './FancyDrawerHeader';
import { CustomIconProps } from '../FancyIcons';
import { router } from 'expo-router';
import FancyDrawerItem from './FancyDrawerItem';
import FancyDrawerSeparator from './FancyDrawerSeparator';
import FancyScrollView from '../FancyScrollView';

export type FancyDrawerProps = {} & DrawerContentComponentProps;

export type DrawerItemData = {
  icon?: CustomIconProps;
  label: string;
  items?: DrawerItemData[];
  onPress?: () => void;
};

const BASE_MENU: DrawerItemData[] = [
  {
    icon: { name: 'home', library: 'Octicons', size: 18 },
    label: 'Início',
    onPress: () => router.push('/'),
  },
  {
    label: 'Indisponibilidade',
    icon: { name: 'calendar-times', library: 'FontAwesome6', size: 18 },
    onPress: () => router.push('/pessoal/indisponibilidade'),
  },
  {
    label: 'Escalas',
    icon: { name: 'calendar-today', library: 'MaterialCommunityIcons', size: 21 },
    onPress: () => router.push('/pessoal/escalas'),
  },
];

const ADMIN_MENU: DrawerItemData[] = [
  {
    icon: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
    label: 'Eventos',
    onPress: () => router.replace('/admin/eventos'),
  },
  {
    icon: { name: 'grid', library: 'Feather', size: 18 },
    label: 'Ministérios',
    onPress: () => router.replace('/admin/ministerios'),
  },
  {
    icon: { name: 'people', library: 'Octicons', size: 18 },
    label: 'Voluntários',
    onPress: () => router.replace('/admin/voluntarios'),
  },
];

const LEADER_MENU: DrawerItemData[] = [
  {
    icon: { name: 'music', library: 'Feather', size: 18 },
    label: 'Louvor',
    items: [
      {
        label: 'Escalas',
        icon: { name: 'calendar-month', library: 'MaterialCommunityIcons', size: 21 },
        onPress: () => router.replace('/ministerios/escalas'),
      },
      {
        label: 'Integrantes',
        icon: { name: 'people', library: 'Octicons', size: 18 },
        onPress: () => router.replace('/ministerios/integrantes'),
      },
      {
        label: 'Funções',
        icon: { library: 'FontAwesome6', name: 'person-rays', size: 18 },
        onPress: () => router.replace('/ministerios/funcoes'),
      },
      {
        label: 'Repertório',
        icon: { name: 'playlist-music-outline', library: 'MaterialCommunityIcons', size: 20 },
        onPress: () => router.replace('/ministerios/louvor/repertorio'),
      },
      {
        label: 'Solicitações',
        icon: { name: 'file-send-outline', library: 'MaterialCommunityIcons', size: 20 },
        onPress: () => router.replace('/ministerios/solicitacoes'),
      },
      {
        label: 'Templates de Equipe',
        icon: { name: 'file-document-outline', library: 'MaterialCommunityIcons', size: 20 },
        onPress: () => router.replace('/ministerios/templates_equipe'),
      },
    ],
  },
];

export default function FancyDrawer(props: FancyDrawerProps) {
  return (
    <View style={styles.container}>
      <FancyDrawerHeader />
      <View
        style={{
          width: '100%',
          flex: 1,
          borderColor: 'red',
          zIndex: 10,
          marginTop: -15,
        }}
      >
        <FancyScrollView
          topFade={{ style: { borderTopStartRadius: 15, borderTopEndRadius: 15, borderWidth: 0 } }}
          showsVerticalScrollIndicator={true}
          style={styles.menuContainer}
          contentContainerStyle={{ borderRadius: 15 }}
        >
          <FancyDrawerSeparator label="Pessoal" />
          {BASE_MENU.map((item, index) => (
            <FancyDrawerItem key={index} {...item} />
          ))}

          <FancyDrawerSeparator label="Ministérios" />
          {LEADER_MENU.map((item, index) => (
            <FancyDrawerItem key={index} {...item} />
          ))}

          <FancyDrawerSeparator label="Administração" />
          {ADMIN_MENU.map((item, index) => (
            <FancyDrawerItem key={index} {...item} />
          ))}
        </FancyScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  menuContainer: {
    // marginTop: -15,
    backgroundColor: 'white',
    paddingHorizontal: 3,
    borderRadius: 15,
  },
});
