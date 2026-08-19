import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { useAuth } from '../contexts/AuthContext';
import {
  RemoveEventoSetlistResponsavelDto,
  UpdateEventoSetlistResponsavelDto,
} from '../domain/dtos/Evento/update-evento-setlist-responsavel.dto';

export function useEventoSetlistResponsavel() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      eventoId,
      data,
    }: {
      eventoId: string;
      data: UpdateEventoSetlistResponsavelDto;
    }) => IgrejaEventosRepository.atualizarResponsavelSetlist(igrejaAtiva!.id, eventoId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({
      eventoId,
      params,
    }: {
      eventoId: string;
      params: RemoveEventoSetlistResponsavelDto;
    }) => IgrejaEventosRepository.removerResponsavelSetlist(igrejaAtiva!.id, eventoId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  return {
    salvarResponsavelSetlist: mutation.mutateAsync,
    removerResponsavelSetlist: removeMutation.mutateAsync,
    isSavingResponsavelSetlist: mutation.isPending || removeMutation.isPending,
  };
}
