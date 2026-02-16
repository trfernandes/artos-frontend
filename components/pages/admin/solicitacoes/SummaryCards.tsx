import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { Pallete } from '../../../../constants/colors';

type SummaryCardsProps = {
  pendentes: number;
  convitesAtivos: number;
  totalAceitos: number;
};

type SummaryCardItemProps = {
  icon: string;
  iconLib: 'MaterialCommunityIcons' | 'MaterialIcons';
  value: number;
  label: string;
  color: string;
};

function SummaryCardItem({ icon, iconLib, value, label, color }: SummaryCardItemProps) {
  return (
    <View style={[styles.card, { backgroundColor: `${color}12` }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <DefaultIcons.Custom
          library={iconLib}
          name={icon as any}
          size={20}
          color={color}
        />
      </View>
      <FancyText type='bold' size='large' style={{ color }}>
        {value}
      </FancyText>
      <FancyText size='extraSmall' type='bold' color={Pallete.fonts.inactive} numberOfLines={1}>
        {label}
      </FancyText>
    </View>
  );
}

export default function SummaryCards({ pendentes, convitesAtivos, totalAceitos }: SummaryCardsProps) {
  return (
    <View style={styles.container}>
      <SummaryCardItem
        icon='clock-outline'
        iconLib='MaterialCommunityIcons'
        value={pendentes}
        label='Pendentes'
        color='#D97706'
      />
      <SummaryCardItem
        icon='email-outline'
        iconLib='MaterialCommunityIcons'
        value={convitesAtivos}
        label='Convites Ativos'
        color={Pallete.primary}
      />
      <SummaryCardItem
        icon='check-circle-outline'
        iconLib='MaterialCommunityIcons'
        value={totalAceitos}
        label='Aceitos'
        color={Pallete.confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});
