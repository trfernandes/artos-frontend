import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Pallete } from '../../../constants/colors';
import { DashboardEscalaItemDto, ResponseDashboardDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { router } from 'expo-router';
import DashboardSection from './DashboardSection';
import DashboardCard from './DashboardCard';
import DashboardEmpty from './DashboardEmpty';
import ProximaEscalaCard from './ProximaEscalaCard';
import DashboardMiniCalendar from './DashboardMiniCalendar';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import EventoInfoCard from '../common/EventoInfoCard';

type DashboardEscalasSectionProps = {
  data: ResponseDashboardDto;
};

export default function DashboardEscalasSection({ data }: DashboardEscalasSectionProps) {
  const [selectedEscala, setSelectedEscala] = useState<DashboardEscalaItemDto | null>(null);
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
              <ProximaEscalaCard key={`${escala.id}-${escala.eventoData}-${index}`} escala={escala} onPress={() => setSelectedEscala(escala)} />
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

      <FancyBottomSheetModal
        visible={!!selectedEscala}
        onClose={() => setSelectedEscala(null)}
        title='Próxima escala'
        footer={
          selectedEscala ? (
            <FancyButton
              label='Abrir detalhes'
              onPress={() => {
                router.push({
                  pathname: '/pessoal/escalas/evento',
                  params: {
                    evento: JSON.stringify({
                      id: selectedEscala.eventoId,
                      nome: selectedEscala.eventoNome,
                      descricao: selectedEscala.eventoDescricao,
                      local: selectedEscala.eventoLocal,
                      cor: selectedEscala.eventoCor,
                    }),
                    dataOcorrencia: selectedEscala.eventoData,
                    horarioEnsaio: selectedEscala.horarioEnsaio || '',
                    ministerioId: selectedEscala.ministerioId || '',
                    ministerioNome: selectedEscala.ministerioNome,
                  },
                });
                setSelectedEscala(null);
              }}
            />
          ) : undefined
        }
      >
        {selectedEscala ? (
          <View style={styles.sheetContent}>
            <EventoInfoCard
              eventoCor={selectedEscala.eventoCor || Pallete.primary}
              eventoNome={selectedEscala.eventoNome}
              dataOcorrencia={new Date(selectedEscala.eventoData)}
              local={selectedEscala.eventoLocal}
              descricao={selectedEscala.eventoDescricao}
              horarioEnsaio={selectedEscala.horarioEnsaio}
              ministerioNome={selectedEscala.ministerioNome}
            />
            <FancyText size='small' type='semiBold'>
              {`Função: ${selectedEscala.funcaoNome}`}
            </FancyText>
            <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
              {selectedEscala.isConfirmado ? 'Status: Confirmada' : 'Status: Pendente'}
            </FancyText>
          </View>
        ) : null}
      </FancyBottomSheetModal>
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
  sheetContent: {
    gap: 14,
  },
});
