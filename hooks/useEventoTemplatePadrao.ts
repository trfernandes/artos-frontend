import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { RemoveEventoTemplatePadraoDto, UpdateEventoTemplatePadraoDto } from '../domain/dtos/Evento/update-evento-template-padrao.dto';
import { useAuth } from '../contexts/AuthContext';

type SaveEventoTemplatePadraoParams = {
  eventoId: string;
  data: UpdateEventoTemplatePadraoDto;
};

type RemoveEventoTemplatePadraoParams = {
  eventoId: string;
  params: RemoveEventoTemplatePadraoDto;
};

export function useEventoTemplatePadrao() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const mutation = useMutation({
    mutationFn: ({ eventoId, data }: SaveEventoTemplatePadraoParams) =>
      IgrejaEventosRepository.atualizarTemplatePadrao(igrejaAtiva.id, eventoId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ eventoId, params }: RemoveEventoTemplatePadraoParams) =>
      IgrejaEventosRepository.removerTemplatePadrao(igrejaAtiva.id, eventoId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  return {
    salvarTemplatePadrao: mutation.mutateAsync,
    removerTemplatePadrao: removeMutation.mutateAsync,
    isSavingTemplatePadrao: mutation.isPending || removeMutation.isPending,
    error: mutation.error || removeMutation.error,
  };
}
