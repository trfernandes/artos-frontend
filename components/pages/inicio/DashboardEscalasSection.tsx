import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Pallete } from '../../../constants/colors';
import { ResponseDashboardDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { router } from 'expo-router';
import DashboardSection from './DashboardSection';
import DashboardCard from './DashboardCard';
import DashboardEmpty from './DashboardEmpty';
import ProximaEscalaCard from './ProximaEscalaCard';
import DashboardMiniCalendar from './DashboardMiniCalendar';

type DashboardEscalasSectionProps = {
  data: ResponseDashboardDto;
};

export default function DashboardEscalasSection({ data }: DashboardEscalasSectionProps) {
  const proximasEscalasUnicas = useMemo(() => {
    const escalas = data?.proximasEscalas ?? [];
    const seen = new Set<string>();

    return escalas.filter((escala) => {
      const signature = [
        escala.eventoData,
        escala.eventoNome?.trim().toLowerCase(),
        escala.funcaoNome?.trim().toLowerCase(),
        escala.ministerioNome?.trim().toLowerCase(),
        escala.isConfirmado ? '1' : '0',
      ].join('|');

      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }, [data?.proximasEscalas]);

  return (
    <>
      {/* KPIs do mês */}
      <DashboardSection title="Minhas escalas" onVerMais={() => router.push('/(app)/(drawer)/pessoal/escalas')}>
        <View style={styles.kpiRow}>
          <DashboardCard
            title="Total"
            value={data?.totalEscalasMes ?? 0}
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar-month', size: 12, color: Pallete.primary }}
            iconBackgroundColor={`${Pallete.primary}15`}
            surfaceVariant='infoBlue'
          />
          <DashboardCard
            title="Confirmadas"
            value={data?.escalasConfirmadas ?? 0}
            icon={{ library: 'MaterialCommunityIcons', name: 'check-circle-outline', size: 12, color: Pallete.confirm }}
            iconBackgroundColor={`${Pallete.confirm}15`}
            surfaceVariant='infoBlue'
          />
          <DashboardCard
            title="Pendentes"
            value={data?.escalasPendentes ?? 0}
            icon={{ library: 'MaterialCommunityIcons', name: 'clock-outline', size: 12, color: Pallete.warning }}
            iconBackgroundColor={`${Pallete.warning}15`}
            surfaceVariant='infoBlue'
          />
        </View>
      </DashboardSection>

      {/* Próximas escalas - scroll horizontal */}
      <DashboardSection
        title="Próximas escalas"
        onVerMais={() => router.push('/(app)/(drawer)/pessoal/escalas')}
      >
        {proximasEscalasUnicas.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {proximasEscalasUnicas.map((escala, index) => (
              <ProximaEscalaCard key={`${escala.id}-${escala.eventoData}-${index}`} escala={escala} />
            ))}
          </ScrollView>
        ) : (
          <DashboardEmpty category="escalas" />
        )}
      </DashboardSection>

      {/* Mini calendário */}
      <DashboardSection title="Calendário">
        <DashboardMiniCalendar escalas={data?.proximasEscalas} />
      </DashboardSection>
    </>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 5,
  },
});
