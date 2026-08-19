import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';

export function useEventoEquipe(eventoId?: string, dataOcorrencia?: string, ministerioId?: string) {
  const { igrejaAtiva } = useAuth();

  return useQuery({
    queryKey: ['evento-equipe', igrejaAtiva?.id, eventoId, ministerioId, dataOcorrencia],
    enabled: !!igrejaAtiva && !!eventoId && !!ministerioId && !!dataOcorrencia,
    queryFn: () =>
      IgrejaEventosRepository.listarEquipe(
        igrejaAtiva!.id,
        eventoId!,
        ministerioId!,
        dataOcorrencia!,
      ),
  });
}
