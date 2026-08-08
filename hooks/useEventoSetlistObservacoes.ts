import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { UpsertEventoSetlistObservacoesDto } from '../domain/dtos/Evento/evento-setlist-observacoes.update';

export function useEventoSetlistObservacoes(
  eventoId?: string,
  dataOcorrencia?: string,
  ministerioId?: string,
) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const queryKey = [
    'evento-setlist-observacoes',
    igrejaAtiva.id,
    eventoId,
    ministerioId,
    dataOcorrencia,
  ];

  const query = useQuery({
    queryKey,
    enabled: !!eventoId && !!ministerioId && !!dataOcorrencia,
    queryFn: () =>
      IgrejaEventosRepository.obterObservacoesSetlist(
        igrejaAtiva.id,
        eventoId!,
        ministerioId!,
        dataOcorrencia!,
      ),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const mutation = useMutation({
    mutationFn: (dto: UpsertEventoSetlistObservacoesDto) =>
      IgrejaEventosRepository.salvarObservacoesSetlist(igrejaAtiva.id, eventoId!, dto),
    onSuccess: invalidate,
  });

  return {
    ...query,
    salvarObservacoes: mutation.mutateAsync,
    isSavingObservacoes: mutation.isPending,
  };
}
