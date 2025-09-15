import { StyleSheet, View } from 'react-native';
import FancyBaseListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyText from '../../../../../components/FancyText';
import { router } from 'expo-router';

const DATA: { startDate: Date; endDate: Date; status: 'Pendente' | 'Finalizada' }[] = [
  {
    startDate: new Date(),
    endDate: new Date(),
    status: 'Pendente',
  },
];

export default function MinisterioEscalasIndex() {
  return (
    <FancyBaseListPage
      containerStyle={{ paddingTop: 0 }}
      showSearchBar={false}
      fabProps={{
        icon: { library: 'MaterialCommunityIcons', name: 'timetable', size: 26 },
        onPress: () => {
          router.push('ministerios/escalas/add');
        },
      }}
      listProps={{
        data: DATA,
        renderItem: ({ item }) => (
          <FancyCard.Icon
            subtitle={
              <View style={{ gap: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <FancyText size={'small'} type="bold">
                    De:
                  </FancyText>
                  <FancyText size={'small'} type="medium">
                    {item.startDate.toLocaleDateString()}
                  </FancyText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <FancyText size={'small'} type="bold">
                    Até:
                  </FancyText>
                  <FancyText size={'small'} type="medium">
                    {item.endDate.toLocaleDateString()}
                  </FancyText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <FancyText size={'small'} type="bold">
                    Status:
                  </FancyText>
                  <FancyText size={'small'} type="medium">
                    {item.status}
                  </FancyText>
                </View>
              </View>
            }
            cardIcon={{ ...DefaultIconsNames['calendar-month'], size: 18 }}
            actionButtons={[
              {
                icon: { ...DefaultIconsNames['chevron-right'], size: 18 },
                onPress: () => {
                  router.push('ministerios/escalas/details');
                },
              },
            ]}
          />
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    borderWidth: 0,
    borderColor: 'hotpink',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
});
