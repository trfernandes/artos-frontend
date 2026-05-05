import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../../constants/colors';
import DashboardCard from './DashboardCard';

type DashboardKpiGridProps = {
  totalMinisterios: number;
  totalVoluntarios: number;
  totalEventosMes: number;
};

export default function DashboardKpiGrid({
  totalMinisterios,
  totalVoluntarios,
  totalEventosMes,
}: DashboardKpiGridProps) {
  return (
    <View style={styles.row}>
      <DashboardCard
        title="Ministérios"
        value={totalMinisterios}
        icon={{ library: 'MaterialCommunityIcons', name: 'account-group', size: 12, color: Pallete.primary }}
        iconBackgroundColor={`${Pallete.primary}15`}
        surfaceVariant='infoBlue'
      />
      <DashboardCard
        title="Voluntários"
        value={totalVoluntarios}
        icon={{ library: 'MaterialCommunityIcons', name: 'account-multiple', size: 12, color: Pallete.secondary }}
        iconBackgroundColor={`${Pallete.secondary}15`}
        surfaceVariant='infoBlue'
      />
      <DashboardCard
        title="Eventos"
        value={totalEventosMes}
        icon={{ library: 'MaterialCommunityIcons', name: 'calendar-month', size: 12, color: Pallete.terciary }}
        iconBackgroundColor={`${Pallete.terciary}15`}
        surfaceVariant='infoBlue'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
