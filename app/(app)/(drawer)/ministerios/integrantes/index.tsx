import { View } from 'react-native';
import { PEOPLE_DATA } from '../../../../../components/pages/admin/eventos/EventosEscalaEquipe';
import { useState } from 'react';
import AdicionarModal from '../../../../../components/pages/ministerios/integrantes/AdicionarModal';
import FancyBaseListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import DefaultIcons from '../../../../../components/FancyIcons';
import FancyText from '../../../../../components/FancyText';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';

export default function MinisterioIntegrantesIndex() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  return (
    <FancyBaseListPage
      listProps={{
        data: PEOPLE_DATA,
        renderItem: ({ item }) =>
          item.type === 'escalado' ? (
            <FancyCard.Image
              type="image"
              props={{
                title: item.nome,
                subtitle: `email@email.com`,
                additionalData1: (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderWidth: 0,
                      paddingTop: 2,
                    }}
                  >
                    <DefaultIcons.Custom
                      library={'Octicons'}
                      name={'dot-fill'}
                      // color={item.status === 'ativo' ? 'forestgreen' : 'indianred'}
                      color={'forestgreen'}
                      size={12}
                      style={{
                        borderWidth: 0,
                        height: 11,
                        justifyContent: 'flex-start',
                        lineHeight: 10.5,
                      }}
                    />
                    <FancyText
                      size={'extraSmall'}
                      type="semiBold"
                      color={Pallete.fonts.inactive}
                      style={{ lineHeight: 10, borderWidth: 0, height: 11 }}
                    >
                      {/* {item.status === 'ativo' ? 'Ativo' : 'Inativo'} */}
                      Ativo
                    </FancyText>
                  </View>
                ),
                source: item.image!,
                actionButtons: [
                  {
                    icon: { ...DefaultIconsNames.edit, size: 18 },
                    onPress: () => setAddModalVisible(true),
                  },
                  {
                    icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                    onPress: () => {},
                  },
                ],
              }}
            />
          ) : null,
      }}
    >
      {addModalVisible && (
        <AdicionarModal
          title="Novo Integrante"
          voluntarioList={PEOPLE_DATA.map(item => ({ foto: item.image, nome: item.nome }))}
          modalProps={{ visible: addModalVisible }}
          onClose={() => setAddModalVisible(false)}
          onConfirm={() => setAddModalVisible(false)}
        />
      )}
    </FancyBaseListPage>
  );
}
