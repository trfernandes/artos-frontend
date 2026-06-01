import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboard } from '../../../hooks/useDashboard';
import FancyScrollView from '../../FancyScrollView';
import FancyLoading from '../../FancyLoading';
import FancyScreenErrorHandler from '../../error/FancyScreenErrorHandler';
import DashboardEmpty from './DashboardEmpty';
import DashboardGreeting from './DashboardGreeting';
import DashboardSection from './DashboardSection';
import DashboardEscalasSection from './DashboardEscalasSection';
import EventoProximoCard from './EventoProximoCard';
import MinisterioStatsCard from './MinisterioStatsCard';
import SolicitacaoCard from './SolicitacaoCard';
import { router } from 'expo-router';

export default function DashboardLider() {
  const { user, igrejaAtiva } = useAuth();
  const { data, isLoading, isError, error, hasServerData, refetch } = useDashboard();

  if (isLoading) return <FancyLoading />;
  if (isError && !hasServerData && error) {
    return <FancyScreenErrorHandler error={error} onTryAgrainPress={() => void refetch()} />;
  }

  const nomeLider = user?.user?.nome || 'Líder';

  return (
    <FancyScrollView
      fill
      contentContainerStyle={styles.scrollContent}
      bottomFade={{ active: true }}
    >
      <DashboardGreeting nome={nomeLider} subtitulo={igrejaAtiva?.nome} />

      {/* Saúde do Ministério */}
      {data?.ministerioStats && (
        <DashboardSection title='Meu ministério'>
          <MinisterioStatsCard ministerio={data.ministerioStats} variant='full' />
        </DashboardSection>
      )}

      {/* Próximos Eventos do Ministério */}
      <DashboardSection title='Próximos eventos'>
        {data?.proximosEventosMinisterio && data.proximosEventosMinisterio.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {data.proximosEventosMinisterio.map((evento) => (
              <EventoProximoCard
                key={evento.occurrenceKey || `${evento.id}::${evento.dataInicio}`}
                evento={evento}
                variant='horizontal'
              />
            ))}
          </ScrollView>
        ) : (
          <DashboardEmpty category='eventos' />
        )}
      </DashboardSection>

      {/* Solicitações Pendentes */}
      {data?.solicitacoesPendentes && data.solicitacoesPendentes.length > 0 && (
        <DashboardSection
          title='Solicitações'
          badge={data.solicitacoesPendentes.length}
          onVerMais={() => router.push('/(app)/(drawer)/admin/solicitacoes')}
        >
          {data.solicitacoesPendentes.map((solicitacao) => (
            <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
          ))}
        </DashboardSection>
      )}

      {/* Minhas Escalas - widget reutilizável */}
      <DashboardEscalasSection data={data} />
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 30,
    gap: 22,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 5,
  },
});
