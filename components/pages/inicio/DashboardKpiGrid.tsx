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
    <View style={styles.row}>
      <View style={styles.card}>
        <DashboardCard
          layout='center'
          title='Ministérios'
          value={totalMinisterios}
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'account-group',
            size: 16,
            color: palette.primary,
          }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.primary, 0.12)}
          accentColor={palette.primary}
        />
      </View>
      <View style={styles.card}>
        <DashboardCard
          layout='center'
          title='Voluntários'
          value={totalVoluntarios}
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'account-multiple',
            size: 16,
            color: palette.secondary,
          }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.secondary, 0.12)}
          accentColor={palette.secondary}
        />
      </View>
      <View style={styles.card}>
        <DashboardCard
          layout='center'
          title='Eventos'
          value={totalEventosMes}
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'calendar-month',
            size: 16,
            color: palette.terciary,
          }}
          iconBackgroundColor={ColorUtils.withAlpha(palette.terciary, 0.12)}
          accentColor={palette.terciary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
  },
});
