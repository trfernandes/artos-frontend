import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { usePallete } from '../../../hooks/usePallete';
import {
  DashboardEscalaItemDto,
  ResponseDashboardDto,
} from '../../../domain/dtos/Dashboard/dashboard.response';
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

type EscalaFuncao = { nome: string; isConfirmado: boolean };
type ProximaEscalaAgregada = DashboardEscalaItemDto & { funcoes: EscalaFuncao[] };

export default function DashboardEscalasSection({ data }: DashboardEscalasSectionProps) {
  const Pallete = usePallete();
  const [selectedEscala, setSelectedEscala] = useState<ProximaEscalaAgregada | null>(null);
  const proximasEscalasUnicas = useMemo<ProximaEscalaAgregada[]>(() => {
    const escalas = data?.proximasEscalas ?? [];
    const porEvento = new Map<string, ProximaEscalaAgregada>();

    for (const escala of escalas) {
      // Agrupa por evento/data/ministério — escalado em mais de uma função no mesmo
      // evento vira um card só, com as funções acumuladas.
      const signature = [
        escala.eventoData,
        escala.eventoNome?.trim().toLowerCase(),
        escala.ministerioNome?.trim().toLowerCase(),
      ].join('|');

      const existente = porEvento.get(signature);
      if (existente) {
        if (!existente.funcoes.some((f) => f.nome === escala.funcaoNome)) {
          existente.funcoes.push({ nome: escala.funcaoNome, isConfirmado: escala.isConfirmado });
        }
      } else {
        porEvento.set(signature, {
          ...escala,
          funcoes: [{ nome: escala.funcaoNome, isConfirmado: escala.isConfirmado }],
        });
      }
    }

    // Card agregado: funcaoNome = lista concatenada; status confirmado só se todas
    // as funções estiverem confirmadas (pendente se qualquer uma pendente).
    return Array.from(porEvento.values()).map((item) => ({
      ...item,
      funcaoNome: item.funcoes.map((f) => f.nome).join(', '),
      isConfirmado: item.funcoes.every((f) => f.isConfirmado),
    }));
  }, [data?.proximasEscalas]);

  return (
    <>
      {/* KPIs do mês */}
      <DashboardSection
        title='Minhas escalas'
        onVerMais={() => router.push('/(app)/(drawer)/pessoal/escalas')}
      >
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <DashboardCard
              layout='center'
              title='Total'
              value={data?.totalEscalasMes ?? 0}
              icon={{
                library: 'MaterialCommunityIcons',
                name: 'calendar-month',
                size: 16,
                color: Pallete.primary,
              }}
              iconBackgroundColor={`${Pallete.primary}1F`}
              accentColor={Pallete.primary}
            />
          </View>
          <View style={styles.kpiCard}>
            <DashboardCard
              layout='center'
              title='Confirmadas'
              value={data?.escalasConfirmadas ?? 0}
              icon={{
                library: 'MaterialCommunityIcons',
                name: 'check-circle-outline',
                size: 16,
                color: Pallete.confirm,
              }}
              iconBackgroundColor={`${Pallete.confirm}1F`}
              accentColor={Pallete.confirm}
            />
          </View>
          <View style={styles.kpiCard}>
            <DashboardCard
              layout='center'
              title='Pendentes'
              value={data?.escalasPendentes ?? 0}
              icon={{
                library: 'MaterialCommunityIcons',
                name: 'clock-outline',
                size: 16,
                color: Pallete.warning,
              }}
              iconBackgroundColor={`${Pallete.warning}1F`}
              accentColor={Pallete.warning}
            />
          </View>
        </View>
      </DashboardSection>

      {/* Próximas escalas - scroll horizontal */}
      <DashboardSection
        title='Próximas escalas'
        onVerMais={() => router.push('/(app)/(drawer)/pessoal/escalas')}
      >
        {proximasEscalasUnicas.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {proximasEscalasUnicas.map((escala, index) => (
              <ProximaEscalaCard
                key={`${escala.id}-${escala.eventoData}-${index}`}
                escala={escala}
                onPress={() => setSelectedEscala(escala)}
              />
            ))}
          </ScrollView>
        ) : (
          <DashboardEmpty category='escalas' />
        )}
      </DashboardSection>

      {/* Mini calendário */}
      <DashboardSection title='Calendário'>
        <DashboardMiniCalendar escalas={proximasEscalasUnicas} />
      </DashboardSection>

      <FancyBottomSheetModal
        visible={!!selectedEscala}
        onClose={() => setSelectedEscala(null)}
        title='Próxima escala'
        footer={
          selectedEscala ? (
            <FancyButton
              label='Abrir detalhes'
              icon={{ library: 'MaterialCommunityIcons', name: 'open-in-new', size: 16 }}
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
            <View style={styles.funcoesList}>
              {selectedEscala.funcoes.map((funcao) => (
                <View key={funcao.nome} style={styles.funcaoRow}>
                  <FancyText size='small' type='semiBold'>
                    {funcao.nome}
                  </FancyText>
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={funcao.isConfirmado ? Pallete.confirm : Pallete.warning}
                  >
                    {funcao.isConfirmado ? 'Confirmada' : 'Pendente'}
                  </FancyText>
                </View>
              ))}
            </View>
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
  kpiCard: {
    flex: 1,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 5,
    paddingVertical: 4,
  },
  sheetContent: {
    gap: 14,
  },
  funcoesList: {
    gap: 8,
  },
  funcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
