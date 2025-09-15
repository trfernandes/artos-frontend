import FancyTabs, { TabItem } from '../../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../../constants/icons';
import { Pallete } from '../../../../../../constants/colors';
import DadosTab from '../../../../../../components/pages/ministerios/louvor/repertorio/DadosTab';
import LetraTab from '../../../../../../components/pages/ministerios/louvor/repertorio/LetraTab';
import CifraTab from '../../../../../../components/pages/ministerios/louvor/repertorio/CifraTab';

const TAB_DATAS: TabItem[] = [
  {
    title: 'Dados',
    icon: { ...DefaultIconsNames.info, size: 16 },
    content: <DadosTab />,
  },
  {
    title: 'Letra',
    icon: { library: 'Entypo', name: 'text', size: 16 },
    content: <LetraTab />,
  },
  {
    title: 'Cifra',
    icon: { library: 'MaterialCommunityIcons', name: 'playlist-music-outline', size: 18 },
    content: <CifraTab />,
  },
];

export default function MinisterioLouvorRepertorioAddPage() {
  return (
    <FancyTabs
      items={TAB_DATAS}
      containerStyle={{
        flex: 1,
        backgroundColor: Pallete.backgroundColor,
        paddingVertical: 10,
        gap: 20,
      }}
      contentContainerStyle={{ flex: 1 }}
    />
  );
}
