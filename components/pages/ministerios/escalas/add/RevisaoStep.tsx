import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import FancySeparator from '../../../../FancySeparator';
import FancyText from '../../../../FancyText';
import FancyList from '../../../../list/FancyList';
import { PEOPLE_DATA } from '../../../admin/eventos/EventosEscalaEquipe';
import { EVENTS_DATA } from '../details/DefinicoesTab';
import { Image } from 'expo-image';

export default function RevisaoStep() {
  return (
    <View style={styles.container}>
      <FancyList
        data={EVENTS_DATA.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())}
        renderItem={({ item }) => (
          <FancyCard.Icon
            title={item.nome}
            subtitle={`${item.dataInicio.toLocaleDateString()} à ${item.dataTermino.toLocaleDateString()}`}
            additionalData1={`${item.horaInicio} à ${item.horaTermino}`}
            cardIcon={{ ...DefaultIconsNames['calendar-day'], size: 16 }}
            isCollapsable={true}
            actionButtons={[{ icon: { ...DefaultIconsNames.edit, size: 16 } }]}
            content={
              <View style={styles.equipeContainer}>
                {PEOPLE_DATA.filter(item => item.type === 'escalado')
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((item, index) => (
                    <View style={{}}>
                      <View style={styles.equipeItem}>
                        <Image source={{ uri: item.image }} style={{ width: 30, height: 30, borderRadius: 100 }} />
                        <FancyText
                          size={'small'}
                          type="medium"
                          style={{ borderWidth: 0, flex: 1 }}
                          adjustsFontSizeToFit
                          numberOfLines={2}
                        >
                          {item.nome}
                        </FancyText>
                        <FancyText
                          size={'small'}
                          type="semiBold"
                          adjustsFontSizeToFit
                          numberOfLines={2}
                          style={{ width: 100, textAlign: 'right' }}
                        >
                          {item.funcao}
                        </FancyText>
                      </View>
                      {index === PEOPLE_DATA.length - 2 ? null : <FancySeparator style={{ paddingVertical: 10 }} />}
                    </View>
                  ))}
              </View>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 15 },
  equipeContainer: {
    backgroundColor: Pallete.backgroundColor,
    padding: 10,
    paddingRight: 15,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Pallete.border,
    marginBottom: 5,
  },
  equipeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0 },
});
