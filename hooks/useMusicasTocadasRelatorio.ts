import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaEventosRepository } from '../domain/services/IgrejaEventosRepository';
import { GetMusicasTocadasRelatorioParams } from '../domain/dtos/Evento/musicas-tocadas-relatorio.dto';

export function useMusicasTocadasRelatorio(params: GetMusicasTocadasRelatorioParams | null) {
  const { igrejaAtiva } = useAuth();

  return useQuery({
    queryKey: ['musicas-tocadas-relatorio', igrejaAtiva?.id, params],
    enabled: !!igrejaAtiva && !!params?.ministerioId,
    staleTime: 1000 * 60,
    queryFn: () => IgrejaEventosRepository.obterRelatorioMusicasTocadas(igrejaAtiva!.id, params!),
  });
}
