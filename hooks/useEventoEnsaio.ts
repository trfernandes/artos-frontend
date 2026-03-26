import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { RemoveEventoEnsaioDto, UpdateEventoEnsaioDto } from '../domain/dtos/Evento/update-evento-ensaio.dto';
import { useAuth } from '../contexts/AuthContext';

type SaveEventoEnsaioParams = {
  eventoId: string;
  data: UpdateEventoEnsaioDto;
};

type RemoveEventoEnsaioParams = {
  eventoId: string;
  params: RemoveEventoEnsaioDto;
};

export function useEventoEnsaio() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const mutation = useMutation({
    mutationFn: ({ eventoId, data }: SaveEventoEnsaioParams) =>
      IgrejaEventosRepository.atualizarEnsaio(igrejaAtiva.id, eventoId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ eventoId, params }: RemoveEventoEnsaioParams) =>
      IgrejaEventosRepository.removerEnsaio(igrejaAtiva.id, eventoId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  return {
    salvarEnsaio: mutation.mutateAsync,
    removerEnsaio: removeMutation.mutateAsync,
    isSavingEnsaio: mutation.isPending || removeMutation.isPending,
    error: mutation.error || removeMutation.error,
  };
}
