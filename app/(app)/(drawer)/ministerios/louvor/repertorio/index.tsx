import { router } from 'expo-router';
import { FancyCard } from '../../../../../../components/cards/Horizontal/FancyCard';
import { MUSIC_LIST } from '../../../../../../components/pages/admin/eventos/EventosSetListForm';
import FancyBaseListPage from '../../../../../../components/pages/base/FancyBaseListPage';
import { Pallete } from '../../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../../constants/icons';

export default function MinisterioLouvorRepertorioIndexPage() {
  return (
    <FancyBaseListPage
      listProps={{
        data: MUSIC_LIST,
        renderItem: ({ item }) => (
          <FancyCard.Icon
            title={item.nome}
            subtitle={item.artista}
            additionalData1={item.categoria}
            cardIcon={{ library: 'MaterialIcons', name: 'queue-music', size: 20 }}
            actionButtons={[
              {
                icon: { ...DefaultIconsNames.edit, size: 18 },
                onPress: () => {
                  router.push('ministerios/louvor/repertorio/edit');
                },
              },
              { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error }, onPress: () => {} },
            ]}
          />
        ),
      }}
      fabProps={{
        onPress: () => {
          router.push('ministerios/louvor/repertorio/add');
        },
      }}
    />
  );
}
