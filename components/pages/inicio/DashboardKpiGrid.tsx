import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
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
  const palette = usePallete();

  return (
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <DashboardCard
          title='Ministérios'
          value={totalMinisterios}
          icon={{ library: 'MaterialCommunityIcons', name: 'account-group', size: 20, color: palette.primary }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.primary, 0.12)}
          accentColor={palette.primary}
        />
      </View>
      <View style={styles.gridItem}>
        <DashboardCard
          title='Voluntários'
          value={totalVoluntarios}
          icon={{ library: 'MaterialCommunityIcons', name: 'account-multiple', size: 20, color: palette.secondary }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.secondary, 0.12)}
          accentColor={palette.secondary}
        />
      </View>
      <View style={styles.gridItemFull}>
        <DashboardCard
          title='Eventos este mês'
          value={totalEventosMes}
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-month', size: 20, color: palette.terciary }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.terciary, 0.12)}
          accentColor={palette.terciary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  gridItemFull: {
    flexBasis: '100%',
    flexGrow: 1,
  },
});
