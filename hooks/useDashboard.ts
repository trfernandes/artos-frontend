import { useQuery } from '@tanstack/react-query';
import { DashboardRepository } from '../domain/services/DashboardRepository';
import { useAuth } from '../contexts/AuthContext';
import { ResponseDashboardDto } from '../domain/dtos/Dashboard/dashboard.response';
import { getApiErrorMessage } from '../domain/api/api-error';

const EMPTY_DASHBOARD: ResponseDashboardDto = {
  proximasEscalas: [],
  totalEscalasMes: 0,
  escalasConfirmadas: 0,
  escalasPendentes: 0,
  proximosEventosMinisterio: [],
  solicitacoesPendentes: [],
  totalMinisterios: 0,
  totalVoluntarios: 0,
  totalEventosMes: 0,
  ministeriosStats: [],
  proximosEventosIgreja: [],
  solicitacoesGerais: [],
};

export function useDashboard() {
  const { igrejaAtiva, user } = useAuth();

  const query = useQuery({
    queryKey: ['dashboard', igrejaAtiva?.id, igrejaAtiva?.role, user?.user?.id],
    queryFn: () => {
      if (!igrejaAtiva?.id) throw new Error('Igreja não selecionada');
      if (!user?.user?.id) throw new Error('Usuário não autenticado');
      return DashboardRepository.getDashboard({
        igrejaId: igrejaAtiva.id,
        userId: user.user.id,
        role: igrejaAtiva.role,
        ministeriosUsuario: igrejaAtiva.ministerios ?? [],
      });
    },
    enabled: !!igrejaAtiva?.id && !!user?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  const hasServerData = query.data !== undefined;
  const errorMessage = query.error ? getApiErrorMessage(query.error, 'Não foi possível carregar o dashboard.') : null;

  const data: ResponseDashboardDto = {
    ...EMPTY_DASHBOARD,
    ...(query.data ?? {}),
  };

  return {
    ...query,
    data,
    hasServerData,
    errorMessage,
  };
}

export function useMinisterioDashboard(ministerioId?: string) {
  return useQuery({
    queryKey: ['ministerio-dashboard', ministerioId],
    queryFn: () => {
      if (!ministerioId) throw new Error('Ministério não selecionado');
      return DashboardRepository.getMinisterioDashboard(ministerioId);
    },
    enabled: !!ministerioId,
    staleTime: 1000 * 60 * 5,
  });
}
