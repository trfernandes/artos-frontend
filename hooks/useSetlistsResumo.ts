import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { GetSetlistsResumoParams } from '../domain/dtos/Evento/setlists-resumo.dto';

export function useSetlistsResumo(ministerioId?: string, params?: GetSetlistsResumoParams) {
  const { igrejaAtiva } = useAuth();

  return useQuery({
    queryKey: ['setlists-resumo', igrejaAtiva?.id, ministerioId, params],
    enabled: !!igrejaAtiva?.id && !!ministerioId,
    staleTime: 1000 * 60,
    queryFn: () =>
      IgrejaEventosRepository.obterSetlistsResumo(igrejaAtiva!.id, ministerioId!, params),
  });
}
