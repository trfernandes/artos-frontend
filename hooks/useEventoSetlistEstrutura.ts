import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { UpsertEventoSetlistItemEstruturaDto } from '../domain/dtos/Evento/evento-setlist-item-estrutura.update';

export function useEventoSetlistEstrutura(
  eventoId?: string,
  itemId?: string,
  dataOcorrencia?: string,
  ministerioId?: string,
) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = [
    'evento-setlist-estrutura',
    igrejaAtiva?.id,
    eventoId,
    itemId,
    ministerioId,
    dataOcorrencia,
  ];

  const query = useQuery({
    queryKey,
    enabled: !!igrejaAtiva && !!eventoId && !!itemId && !!ministerioId && !!dataOcorrencia,
    queryFn: () =>
      IgrejaEventosRepository.obterEstruturaSetlistItem(
        igrejaAtiva!.id,
        eventoId!,
        itemId!,
        ministerioId!,
        dataOcorrencia!,
      ),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({
      queryKey: ['evento-setlist', igrejaAtiva!.id, ministerioId, eventoId, dataOcorrencia],
    });
  };

  const replaceMutation = useMutation({
    mutationFn: (dto: UpsertEventoSetlistItemEstruturaDto) =>
      IgrejaEventosRepository.substituirEstruturaSetlistItem(
        igrejaAtiva!.id,
        eventoId!,
        itemId!,
        dto,
      ),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      IgrejaEventosRepository.removerEstruturaSetlistItem(
        igrejaAtiva!.id,
        eventoId!,
        itemId!,
        ministerioId!,
        dataOcorrencia!,
      ),
    onSuccess: invalidate,
  });

  return {
    ...query,
    substituirEstrutura: replaceMutation.mutateAsync,
    removerOverrideEstrutura: deleteMutation.mutateAsync,
    isMutating: replaceMutation.isPending || deleteMutation.isPending,
  };
}
