import { View } from 'react-native';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyFab from '../../../../buttons/FancyFab';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import FancyTextArea from '../../../../fields/FancyTextArea';
import FancyList from '../../../../list/FancyList';
import { MUSIC_LIST } from '../../../admin/eventos/EventosSetListForm';

export default function EscalaEventoSetlistTab() {
  return (
    <View style={{ borderWidth: 0, flex: 1, gap: 20, paddingBottom: 10 }}>
      <FancyList
        containerStyle={{ flex: 1 }}
        data={MUSIC_LIST}
        renderItem={({ item }) => (
          <FancyCard.Image
            type='letter'
            props={{
              title: item.nome,
              subtitle: item.artista,
              additionalData1: `Tom: ${item.tom}  |  Bpm: ${item.bpm}`,
              letter: item.order.toString(),
              actionButtons: [{ icon: { ...DefaultIconsNames.open, size: 16 } }],
            }}
          />
        )}
      />
      <FancyTextArea label='Observações' disabled value='Vamos faze a 2 e 3 em medley so estrofe e refrão' />
      <FancyFab icon={{ ...DefaultIconsNames.edit, size: 26 }} />
    </View>
  );
}
