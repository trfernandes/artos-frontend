import { View, StyleSheet } from 'react-native';
import FancyList from '../../../../list/FancyList';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import FancyText from '../../../../FancyText';

const EVENTS_DATA = [
  {
    event: {
      nome: 'The Way',
      dataInicio: new Date(2025, 7, 9),
      dataTermino: new Date(2025, 7, 9),
      horaInicio: '15:00',
      horaTermino: '17:00',
    },
    checked: false,
  },
  {
    event: {
      nome: 'RUAH',
      dataInicio: new Date(2025, 7, 9),
      dataTermino: new Date(2025, 7, 9),
      horaInicio: '19:30',
      horaTermino: '22:00',
    },
    checked: true,
  },
  {
    event: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 10),
      dataTermino: new Date(2025, 7, 10),
      horaInicio: '18:00',
      horaTermino: '21:00',
    },
    checked: false,
  },
];

export default function EventosStep() {
  return (
    <View style={[styles.container]}>
      <FancyList
        containerStyle={{ flex: 1 }}
        data={EVENTS_DATA}
        renderItem={({ item }) => (
          <FancyCard.CheckBox
            title={item.event.nome}
            subtitle={`${item.event.dataInicio.toLocaleDateString()} à ${item.event.dataTermino.toLocaleDateString()}`}
            additionalData1={`${item.event.horaInicio} à ${item.event.horaTermino}`}
            value={item.checked}
          />
        )}
      />
      <FancyText size={'extraSmall'} type="semiBoldItalic">
        * Os eventos selecionados serão incluídos na escala
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 15, flex: 1 },
});
