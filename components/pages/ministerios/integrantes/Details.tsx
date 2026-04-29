import { DefaultIconsNames } from '../../../../constants/icons';
import FancyTabs, { TabItem } from '../../../tabs/FancyTabs';
import DadosTab from './DadosTab';
import HabilidadesTab from './HabilidadesTab';

const TABS_DATA: TabItem[] = [
  { title: 'Dados', icon: { ...DefaultIconsNames.info }, content: <DadosTab /> },
  { title: 'Habilidades', icon: { ...DefaultIconsNames.group, size: 20, style: { marginTop: 0 } }, content: <HabilidadesTab /> },
];

export default function Details() {
  return <FancyTabs items={TABS_DATA} />;
}
