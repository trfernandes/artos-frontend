import { Pallete } from '../../../../constants/colors';

// Temas de cores para status de solicitação
export const SOLICITACAO_STATUS_THEMES = {
  PENDING: {
    bg: '#FEFCF3',
    border: '#D97706',
    borderLeft: '#F59E0B',
    icon: '#D97706',
    label: 'Pendente',
    iconName: 'clock-outline' as const,
    iconLib: 'MaterialCommunityIcons' as const,
  },
  APPROVED: {
    bg: '#F6FDF9',
    border: '#059669',
    borderLeft: '#10B981',
    icon: '#059669',
    label: 'Aprovado',
    iconName: 'check-circle-outline' as const,
    iconLib: 'MaterialCommunityIcons' as const,
  },
  DENIED: {
    bg: '#FEF7F7',
    border: '#DC2626',
    borderLeft: '#EF4444',
    icon: '#DC2626',
    label: 'Negado',
    iconName: 'close-circle-outline' as const,
    iconLib: 'MaterialCommunityIcons' as const,
  },
  CANCELED: {
    bg: '#FAFAFA',
    border: '#9CA3AF',
    borderLeft: '#6B7280',
    icon: '#6B7280',
    label: 'Cancelado',
    iconName: 'cancel' as const,
    iconLib: 'MaterialIcons' as const,
  },
} as const;

// Temas de cores para status de convite
export const CONVITE_STATUS_THEMES = {
  ATIVO: {
    bg: '#F6FDF9',
    border: '#059669',
    ticketLine: '#10B981',
    icon: '#059669',
    label: 'Ativo',
    iconName: 'check-circle' as const,
    iconLib: 'MaterialIcons' as const,
  },
  EXPIRADO: {
    bg: '#FEFCF3',
    border: '#D97706',
    ticketLine: '#F59E0B',
    icon: '#D97706',
    label: 'Expirado',
    iconName: 'schedule' as const,
    iconLib: 'MaterialIcons' as const,
  },
  REVOGADO: {
    bg: '#FAFAFA',
    border: '#9CA3AF',
    ticketLine: '#6B7280',
    icon: '#9CA3AF',
    label: 'Revogado',
    iconName: 'block' as const,
    iconLib: 'MaterialIcons' as const,
  },
  ESGOTADO: {
    bg: '#F3F4F6',
    border: '#9CA3AF',
    ticketLine: '#6B7280',
    icon: '#9CA3AF',
    label: 'Esgotado',
    iconName: 'do-not-disturb' as const,
    iconLib: 'MaterialIcons' as const,
  },
} as const;

export type SolicitacaoStatusType = keyof typeof SOLICITACAO_STATUS_THEMES;
export type ConviteStatusType = keyof typeof CONVITE_STATUS_THEMES;

// Helper para obter tema de solicitação
export function getSolicitacaoTheme(status: string) {
  return (
    SOLICITACAO_STATUS_THEMES[status as SolicitacaoStatusType] || SOLICITACAO_STATUS_THEMES.PENDING
  );
}

// Helper para obter tema de convite
export function getConviteTheme(status: string) {
  return CONVITE_STATUS_THEMES[status as ConviteStatusType] || CONVITE_STATUS_THEMES.ATIVO;
}
