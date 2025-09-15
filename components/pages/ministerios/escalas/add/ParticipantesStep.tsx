import { View, StyleSheet } from 'react-native';
import FancyText from '../../../../FancyText';
import { PEOPLE_DATA } from '../../../admin/eventos/EventosEscalaEquipe';
import FancyVerticalContainerCard from '../../../../cards/Vertical/FancyVerticalContainerCard';

export default function ParticipantesStep() {
  return (
    <View style={[styles.container]}>
      <FancyVerticalContainerCard
        data={PEOPLE_DATA.filter(item => item.type !== 'vazio').map(item => ({
          title: item.nome,
          topElement: { type: 'check', checked: false, image: item.image || '' },
        }))}
      />
      <FancyText size={'extraSmall'} type="semiBoldItalic">
        * Os participantes selecionados serão incluídos na escala
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 15, flex: 1 },
});
