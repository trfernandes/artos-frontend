import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function MinisterioEscalasIndexPage() {
  const { ministerioId } = useLocalSearchParams();

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          router.push({
            pathname: '/ministerios/escalas/assistant',
            params: { ministerioId },
          }),
      }}
      listProps={{
        data: [{ title: 'Teste' }],
        renderItem: ({ item }) => (
          <FancyCard.Image
            type="icon"
            props={{
              cardIcon: { ...DefaultIconsNames['calendar-day'], size: 22 },
              title: item.title,
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.add, size: 20 },
                },
              ],
            }}
          />
        ),
      }}
    />
  );
}
