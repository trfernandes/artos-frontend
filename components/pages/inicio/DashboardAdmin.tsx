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
import DashboardKpiGrid from './DashboardKpiGrid';
import DashboardEscalasSection from './DashboardEscalasSection';
import EventoProximoCard from './EventoProximoCard';
import MinisterioStatsCard from './MinisterioStatsCard';
import SolicitacaoCard from './SolicitacaoCard';
import { router } from 'expo-router';
import { useIgrejaAssinatura } from '../../../hooks/useIgrejaAssinatura';
import BillingStatusPanel from '../../billing/BillingStatusPanel';
import BillingNoticeBanner from '../../billing/BillingNoticeBanner';
import { BILLING_STATUS_VISIBLE } from '../../../domain/utils/billing-platform';

export default function DashboardAdmin() {
  const { user, igrejaAtiva } = useAuth();
  const { data, isLoading, isError, error, hasServerData, refetch } = useDashboard();
  const { data: assinatura, abrirPortalDeAssinatura } = useIgrejaAssinatura({
    igrejaId: igrejaAtiva?.id,
  });

  if (isLoading) return <FancyLoading />;
  if (isError && !hasServerData && error) {
    return <FancyScreenErrorHandler error={error} onTryAgrainPress={() => void refetch()} />;
  }

  const nomeAdmin = user?.user?.nome || 'Admin';

  return (
    <FancyScrollView
      fill
      contentContainerStyle={styles.scrollContent}
      bottomFade={{ active: true }}
    >
      <DashboardGreeting nome={nomeAdmin} subtitulo={igrejaAtiva?.nome} />

      {BILLING_STATUS_VISIBLE && (
        <BillingNoticeBanner assinatura={assinatura} onPress={abrirPortalDeAssinatura} />
      )}

      {/* KPIs da Igreja */}
      <DashboardSection title='Visão geral'>
        <DashboardKpiGrid
          totalMinisterios={data?.totalMinisterios ?? 0}
          totalVoluntarios={data?.totalVoluntarios ?? 0}
          totalEventosMes={data?.totalEventosMes ?? 0}
        />
      </DashboardSection>

      {/* Ministérios - Scroll horizontal com cards compact */}
      {data?.ministeriosStats && data.ministeriosStats.length > 0 && (
        <DashboardSection
          title='Ministérios'
          onVerMais={() => router.push('/(app)/(drawer)/admin/ministerios')}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {data.ministeriosStats.map((ministerio) => (
              <MinisterioStatsCard
                key={ministerio.ministerioId}
                ministerio={ministerio}
                variant='compact'
              />
            ))}
          </ScrollView>
        </DashboardSection>
      )}

      {/* Próximos Eventos da Igreja */}
      <DashboardSection
        title='Próximos eventos'
        onVerMais={() => router.push('/(app)/(drawer)/admin/eventos')}
      >
        {data?.proximosEventosIgreja && data.proximosEventosIgreja.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {data.proximosEventosIgreja.map((evento) => (
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

      {/* Solicitações Gerais */}
      {data?.solicitacoesGerais && data.solicitacoesGerais.length > 0 && (
        <DashboardSection
          title='Solicitações'
          badge={data.solicitacoesGerais.length}
          onVerMais={() => router.push('/(app)/(drawer)/admin/solicitacoes')}
        >
          {data.solicitacoesGerais.slice(0, 3).map((solicitacao) => (
            <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
          ))}
        </DashboardSection>
      )}

      {/* Minhas Escalas - widget reutilizável */}
      <DashboardEscalasSection data={data} />

      {BILLING_STATUS_VISIBLE && assinatura ? (
        <BillingStatusPanel
          assinatura={assinatura}
          compact
          primaryLabel='Gerenciar assinatura'
          onPrimaryPress={abrirPortalDeAssinatura}
        />
      ) : null}
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
    paddingVertical: 4,
  },
});
