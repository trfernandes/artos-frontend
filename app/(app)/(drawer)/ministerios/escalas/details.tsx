import DefinicoesTab from '../../../../../components/pages/ministerios/escalas/details/DefinicoesTab';
import ResultadoTab from '../../../../../components/pages/ministerios/escalas/details/ResultadoTab';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';

const TABS_DATA: TabItem[] = [
  {
    title: 'Definições',
    icon: { ...DefaultIconsNames.options, size: 16 },
    content: <DefinicoesTab containerStyle={{ paddingHorizontal: 20, paddingTop: 10 }} />,
  },
  {
    title: 'Escala',
    icon: { library: 'MaterialCommunityIcons', name: 'timetable', size: 16 },
    content: <ResultadoTab />,
  },
];

export default function MinisterioEscalaDetailsPage() {
  return (
    <FancyTabs
      items={TABS_DATA}
      containerStyle={{ flex: 1, paddingTop: 10 }}
      contentContainerStyle={{ flex: 1, paddingTop: 0 }}
    />
  );
}
