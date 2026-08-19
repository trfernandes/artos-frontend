import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import {
  RemoveEventoOcorrenciaDadosDto,
  UpdateEventoOcorrenciaDadosDto,
} from '../domain/dtos/Evento/update-evento-ocorrencia-dados.dto';
import { useAuth } from '../contexts/AuthContext';

type SaveEventoOcorrenciaDadosParams = {
  eventoId: string;
  data: UpdateEventoOcorrenciaDadosDto;
};

type RemoveEventoOcorrenciaDadosParams = {
  eventoId: string;
  params: RemoveEventoOcorrenciaDadosDto;
};

export function useEventoOcorrenciaDados() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ eventoId, data }: SaveEventoOcorrenciaDadosParams) =>
      IgrejaEventosRepository.atualizarDadosOcorrencia(igrejaAtiva!.id, eventoId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ eventoId, params }: RemoveEventoOcorrenciaDadosParams) =>
      IgrejaEventosRepository.removerDadosOcorrencia(igrejaAtiva!.id, eventoId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  return {
    salvarDadosOcorrencia: mutation.mutateAsync,
    removerDadosOcorrencia: removeMutation.mutateAsync,
    isSavingDadosOcorrencia: mutation.isPending || removeMutation.isPending,
    error: mutation.error || removeMutation.error,
  };
}
