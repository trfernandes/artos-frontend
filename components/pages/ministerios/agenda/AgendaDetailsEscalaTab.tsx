import { View } from 'react-native';
import FancyListEmpty from '../../../list/FancyListEmpty';

export default function AgendaDetailsEscalaTab() {
  return (
    <View style={{ flex: 1, height: '100%' }}>
      <FancyListEmpty label='Nenhuma escala encontrada!' />
    </View>
  );
}
