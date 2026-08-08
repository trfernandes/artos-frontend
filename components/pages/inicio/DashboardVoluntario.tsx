import React from 'react';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboard } from '../../../hooks/useDashboard';
import FancyScrollView from '../../FancyScrollView';
import FancyLoading from '../../FancyLoading';
import FancyScreenErrorHandler from '../../error/FancyScreenErrorHandler';
import DashboardGreeting from './DashboardGreeting';
import DashboardEscalasSection from './DashboardEscalasSection';

export default function DashboardVoluntario() {
  const { user, igrejaAtiva } = useAuth();
  const { data, isLoading, isError, error, hasServerData, refetch } = useDashboard();

  if (isLoading) return <FancyLoading />;
  if (isError && !hasServerData && error) {
    return <FancyScreenErrorHandler error={error} onTryAgrainPress={() => void refetch()} />;
  }

  const nomeVoluntario = user?.user?.nome || 'Voluntário';

  return (
    <FancyScrollView
      fill
      contentContainerStyle={styles.scrollContent}
      bottomFade={{ active: true }}
    >
      <DashboardGreeting nome={nomeVoluntario} subtitulo={igrejaAtiva?.nome} />

      <DashboardEscalasSection data={data} />
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 30,
    gap: 12,
  },
});
