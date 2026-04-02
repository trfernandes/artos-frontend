import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { useAuth } from '../contexts/AuthContext';
import { CreateEventoSetlistItemDto } from '../domain/dtos/Evento/evento-setlist-item.create';
import { UpdateEventoSetlistItemDto } from '../domain/dtos/Evento/evento-setlist-item.update';
import { ReorderEventoSetlistDto } from '../domain/dtos/Evento/reorder-evento-setlist.dto';

export function useEventoSetlist(eventoId?: string, dataOcorrencia?: string, ministerioId?: string) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const queryKey = ['evento-setlist', igrejaAtiva.id, ministerioId, eventoId, dataOcorrencia];

  const query = useQuery({
    queryKey,
    enabled: !!eventoId && !!dataOcorrencia && !!ministerioId,
    queryFn: () => IgrejaEventosRepository.listarSetlist(igrejaAtiva.id, eventoId!, ministerioId!, dataOcorrencia!),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey: ['eventos'] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateEventoSetlistItemDto) => IgrejaEventosRepository.criarSetlistItem(igrejaAtiva.id, eventoId!, dto),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ itemId, dto }: { itemId: string; dto: UpdateEventoSetlistItemDto }) =>
      IgrejaEventosRepository.atualizarSetlistItem(igrejaAtiva.id, eventoId!, itemId, dto),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) =>
      IgrejaEventosRepository.removerSetlistItem(igrejaAtiva.id, eventoId!, itemId, ministerioId!, dataOcorrencia!),
    onSuccess: invalidate,
  });
  const reorderMutation = useMutation({
    mutationFn: (dto: ReorderEventoSetlistDto) => IgrejaEventosRepository.reordenarSetlist(igrejaAtiva.id, eventoId!, dto),
    onSuccess: invalidate,
  });

  return {
    ...query,
    criarSetlistItem: createMutation.mutateAsync,
    atualizarSetlistItem: updateMutation.mutateAsync,
    removerSetlistItem: deleteMutation.mutateAsync,
    reordenarSetlist: reorderMutation.mutateAsync,
    isMutatingSetlist:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || reorderMutation.isPending,
  };
}
