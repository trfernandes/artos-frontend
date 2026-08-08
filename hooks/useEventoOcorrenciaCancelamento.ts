import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import {
  CancelEventoOcorrenciaDto,
  RestoreEventoOcorrenciaDto,
} from '../domain/dtos/Evento/update-evento-ocorrencia-dados.dto';
import { useAuth } from '../contexts/AuthContext';

type CancelParams = { eventoId: string; data: CancelEventoOcorrenciaDto };
type RestoreParams = { eventoId: string; params: RestoreEventoOcorrenciaDto };

export function useEventoOcorrenciaCancelamento() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const cancelMutation = useMutation({
    mutationFn: ({ eventoId, data }: CancelParams) =>
      IgrejaEventosRepository.cancelarOcorrencia(igrejaAtiva.id, eventoId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ eventoId, params }: RestoreParams) =>
      IgrejaEventosRepository.restaurarOcorrencia(igrejaAtiva.id, eventoId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  return {
    cancelarOcorrencia: cancelMutation.mutateAsync,
    restaurarOcorrencia: restoreMutation.mutateAsync,
    isMutatingCancelamento: cancelMutation.isPending || restoreMutation.isPending,
    error: cancelMutation.error || restoreMutation.error,
  };
}
