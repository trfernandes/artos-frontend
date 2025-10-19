import { StyleSheet, View } from 'react-native';
import FancyVerticalContainerCard from '../../../../cards/Vertical/FancyVerticalContainerCard';
import { PEOPLE_DATA } from '../../../admin/eventos/EventosEscalaEquipe';

export default function EscalaEventoEquipeTab() {
  return (
    <View style={styles.container}>
      <FancyVerticalContainerCard
        topElementType="image"
        data={PEOPLE_DATA.map(item => ({
          title: item.nome,
          selected: item.nome === 'Thiago Rodrigo Fernandes',
          subtitle: item.funcao || '',
          imageUrl: item.image,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderWidth: 0 },
});
