import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { AuditLogRepository } from '../domain/services/AuditLogRepository';

export function useAuditLog(ministerioId?: string) {
  const { igrejaAtiva } = useAuth();

  return useQuery({
    queryKey: ['audit-logs', igrejaAtiva?.id, ministerioId],
    enabled: !!igrejaAtiva,
    queryFn: () => AuditLogRepository.listar({ igrejaId: igrejaAtiva!.id, ministerioId }),
  });
}
