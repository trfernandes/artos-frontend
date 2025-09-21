import { router } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';

const DATA: { nome: string; tipo: string }[] = [
  { nome: 'Equipe Fixa A', tipo: 'Fixo' },
  { nome: 'Equipe Fixa B', tipo: 'Fixo' },
  { nome: 'Equipe Completa', tipo: 'Funções' },
  { nome: 'Equipe Reduzida', tipo: 'Funções' },
];

export default function MinisterioTemplateEquipeIndex() {
  return (
    <FancyListPage
      listProps={{
        data: DATA,
        renderItem: ({ item }) => (
          <FancyCard.Icon
            title={item.nome}
            subtitle={item.tipo}
            cardIcon={{ ...DefaultIconsNames.group, size: 18, style: { marginTop: -2.5 } }}
            actionButtons={[
              {
                icon: { ...DefaultIconsNames.edit, size: 18 },
                onPress: () => {
                  router.push('ministerios/templates_equipe/form');
                },
              },
              { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error }, onPress: () => {} },
            ]}
          />
        ),
      }}
      fabProps={{ onPress: () => router.push('ministerios/templates_equipe/form') }}
    />
  );
}
