import { useQuery } from '@tanstack/react-query';
import { ChecklistOnboardingRepository } from '../domain/services/ChecklistOnboardingRepository';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../domain/api/api-error';

export function useChecklistOnboardingAdmin() {
  const { igrejaAtiva } = useAuth();

  const query = useQuery({
    queryKey: ['checklist-onboarding-admin', igrejaAtiva?.id],
    queryFn: () => {
      if (!igrejaAtiva?.id) throw new Error('Igreja não selecionada');
      return ChecklistOnboardingRepository.getChecklistAdmin(igrejaAtiva.id);
    },
    enabled: !!igrejaAtiva?.id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const errorMessage = query.error
    ? getApiErrorMessage(query.error, 'Não foi possível carregar o checklist de configuração.')
    : null;

  return { ...query, errorMessage };
}

export function useChecklistOnboardingLider(ministerioId?: string) {
  const query = useQuery({
    queryKey: ['checklist-onboarding-lider', ministerioId],
    queryFn: () => {
      if (!ministerioId) throw new Error('Ministério não selecionado');
      return ChecklistOnboardingRepository.getChecklistLider(ministerioId);
    },
    enabled: !!ministerioId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const errorMessage = query.error
    ? getApiErrorMessage(query.error, 'Não foi possível carregar o checklist de configuração.')
    : null;

  return { ...query, errorMessage };
}
