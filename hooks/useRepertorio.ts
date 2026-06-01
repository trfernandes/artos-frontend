import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { RepertorioRepository } from '../domain/services/RepertorioRepository';
import { DynamicQuery } from '../domain/utils/query_utils';
import { CreateRepertorioCategoriaDto } from '../domain/dtos/Repertorio/repertorio-categoria.create';
import { UpdateRepertorioCategoriaDto } from '../domain/dtos/Repertorio/repertorio-categoria.update';
import { CreateRepertorioMusicaDto } from '../domain/dtos/Repertorio/repertorio-musica.create';
import { UpdateRepertorioMusicaDto } from '../domain/dtos/Repertorio/repertorio-musica.update';

export function useRepertorioCategorias(query?: DynamicQuery) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const queryKey = ['repertorio-categorias', igrejaAtiva.id, query];
  const queryResult = useQuery({
    queryKey,
    queryFn: () => RepertorioRepository.searchCategorias(igrejaAtiva.id, query),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['repertorio-categorias', igrejaAtiva.id] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateRepertorioCategoriaDto) =>
      RepertorioRepository.createCategoria(igrejaAtiva.id, dto),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRepertorioCategoriaDto }) =>
      RepertorioRepository.updateCategoria(igrejaAtiva.id, id, dto),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => RepertorioRepository.removeCategoria(igrejaAtiva.id, id),
    onSuccess: invalidate,
  });

  return {
    ...queryResult,
    criarCategoria: createMutation.mutateAsync,
    atualizarCategoria: updateMutation.mutateAsync,
    removerCategoria: deleteMutation.mutateAsync,
    isMutatingCategoria:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

export function useRepertorioMusicas(ministerioId?: string, query?: DynamicQuery) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const queryKey = ['repertorio-musicas', igrejaAtiva.id, ministerioId, query];
  const queryResult = useQuery({
    queryKey,
    enabled: !!ministerioId,
    queryFn: () => RepertorioRepository.searchMusicas(igrejaAtiva.id, ministerioId!, query),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['repertorio-musicas', igrejaAtiva.id, ministerioId],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateRepertorioMusicaDto) =>
      RepertorioRepository.createMusica(igrejaAtiva.id, ministerioId!, dto),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRepertorioMusicaDto }) =>
      RepertorioRepository.updateMusica(igrejaAtiva.id, ministerioId!, id, dto),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      RepertorioRepository.removeMusica(igrejaAtiva.id, ministerioId!, id),
    onSuccess: invalidate,
  });

  return {
    ...queryResult,
    criarMusica: createMutation.mutateAsync,
    atualizarMusica: updateMutation.mutateAsync,
    removerMusica: deleteMutation.mutateAsync,
    isMutatingMusica:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

export function useYoutubeVersionSearch(query?: string, enabled = true, limit = 6) {
  const { igrejaAtiva } = useAuth();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const normalizedQuery = query?.trim() ?? '';

  return useQuery({
    queryKey: ['youtube-version-search', igrejaAtiva.id, normalizedQuery, limit],
    enabled: enabled && normalizedQuery.length >= 2,
    queryFn: () =>
      RepertorioRepository.searchYoutubeVersions(igrejaAtiva.id, normalizedQuery, limit),
  });
}
