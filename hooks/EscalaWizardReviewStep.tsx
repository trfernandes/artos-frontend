import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePallete } from '../hooks/usePallete';
import { AppImages } from '../assets/app_images';

// --- Interfaces (Adaptar conforme seus DTOs reais) ---

export interface ReviewEvento {
  id: string;
  nome: string;
  horario: string; // ex: "19:00"
  diaSemana?: string; // ex: "Domingo"
  data?: Date; // Se for data específica
}

export interface ReviewParticipante {
  id: string;
  nome: string;
  fotoUrl?: string | null;
  funcoes: string[]; // Lista de nomes das funções (ex: ["Bateria", "Vocal"])
}

export interface EscalaWizardReviewStepProps {
  periodo: { inicio: Date; fim: Date };
  eventos: ReviewEvento[];
  participantes: ReviewParticipante[];
  configuracoes?: {
    modo: string;
    respeitarIndisponibilidade: boolean;
  };
  onEditStep?: (stepIndex: number) => void; // Callback para voltar e editar
}

// --- Componentes Visuais Auxiliares ---

const SectionHeader = ({ title, icon, onEdit }: { title: string; icon: any; onEdit?: () => void }) => {
  const palette = usePallete();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons name={icon} size={20} color={palette.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.editLink, { color: palette.primary }]}>Editar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>{children}</View>
);

const RoleBadge = ({ label }: { label: string }) => (
  <View style={styles.roleBadge}>
    <Text style={styles.roleBadgeText}>{label}</Text>
  </View>
);

export function EscalaWizardReviewStep({
  periodo,
  eventos,
  participantes,
  configuracoes,
  onEditStep,
}: EscalaWizardReviewStepProps) {
  
  // Agrupamento para o Resumo de Cobertura (Contagem por função)
  const resumoFuncoes = useMemo(() => {
    const counts: Record<string, number> = {};
    participantes.forEach((p) => {
      p.funcoes.forEach((f) => {
        counts[f] = (counts[f] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Ordenar por quantidade
  }, [participantes]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Resumo da Geração</Text>
      <Text style={styles.headerSubtitle}>
        Revise os dados antes de gerar a escala.
      </Text>

      {/* --- 1. PERÍODO E CONFIGURAÇÕES --- */}
      <SectionHeader 
        title="Configurações Gerais" 
        icon="cog-outline" 
        onEdit={() => onEditStep?.(0)} 
      />
      <InfoCard>
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Período</Text>
            <Text style={styles.value}>
              {format(periodo.inicio, 'dd/MM', { locale: ptBR })} a{' '}
              {format(periodo.fim, 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.infoItem}>
            <Text style={styles.label}>Modo</Text>
            <Text style={styles.value}>
              {configuracoes?.modo === 'random' ? 'Aleatório' : 'Equilibrado'}
            </Text>
          </View>
        </View>
      </InfoCard>

      {/* --- 2. EVENTOS SELECIONADOS --- */}
      <SectionHeader 
        title={`Eventos (${eventos.length})`} 
        icon="calendar-month-outline" 
        onEdit={() => onEditStep?.(1)} 
      />
      <InfoCard>
        {eventos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum evento selecionado.</Text>
        ) : (
          <View style={styles.eventList}>
            {eventos.map((evento, index) => (
              <View key={evento.id} style={[
                styles.eventRow, 
                index !== eventos.length - 1 && styles.borderBottom
              ]}>
                <View style={styles.eventIconBg}>
                  <MaterialCommunityIcons name="church" size={18} color="#4B5563" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventName}>{evento.nome}</Text>
                  <Text style={styles.eventDetail}>
                    {evento.diaSemana ? `${evento.diaSemana} • ` : ''}{evento.horario}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </InfoCard>

      {/* --- 3. PARTICIPANTES --- */}
      <SectionHeader 
        title={`Equipe Selecionada (${participantes.length})`} 
        icon="account-group-outline" 
        onEdit={() => onEditStep?.(2)} 
      />
      
      {/* Resumo de Cobertura (Chips horizontais) */}
      {resumoFuncoes.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coverageScroll}>
          {resumoFuncoes.map(([funcao, count]) => (
            <View key={funcao} style={styles.coverageChip}>
              <Text style={styles.coverageText}>
                <Text style={{ fontWeight: 'bold' }}>{count}</Text> {funcao}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.participantsContainer}>
        {participantes.map((participante) => (
          <View key={participante.id} style={styles.participantCard}>
            <Image 
              source={participante.fotoUrl ? { uri: participante.fotoUrl } : AppImages.emptyProfile} 
              style={styles.avatar} 
            />
            <View style={styles.participantInfo}>
              <Text style={styles.participantName} numberOfLines={1}>
                {participante.nome}
              </Text>
              
              {/* Lista de Funções (Badges) */}
              <View style={styles.badgesContainer}>
                {participante.funcoes.map((funcao) => (
                  <RoleBadge key={funcao} label={funcao} />
                ))}
              </View>
            </View>
          </View>
        ))}
        
        {participantes.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhum participante selecionado.</Text>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Gray 50
  },
  contentContainer: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // Gray 900
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280', // Gray 500
    marginBottom: 24,
  },
  
  // Headers de Seção
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // Gray 700
  },
  editLink: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Cards Genéricos
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Info Row (Período/Config)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Lista de Eventos
  eventList: {
    gap: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  eventIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  eventDetail: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Participantes
  coverageScroll: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  coverageChip: {
    backgroundColor: '#ECFDF5', // Emerald 50
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  coverageText: {
    fontSize: 12,
    color: '#065F46', // Emerald 800
  },
  participantsContainer: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF', // Blue 50
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E40AF', // Blue 800
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});