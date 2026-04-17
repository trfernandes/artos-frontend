import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { RepertorioRepository } from '../domain/services/RepertorioRepository';
import { CreateRepertorioMusicaSecaoDto } from '../domain/dtos/Repertorio/repertorio-musica-secao.create';
import { UpdateRepertorioMusicaSecaoDto } from '../domain/dtos/Repertorio/repertorio-musica-secao.update';
import { UpsertRepertorioMusicaArranjoDto } from '../domain/dtos/Repertorio/repertorio-musica-arranjo.update';

export function useRepertorioMusicaEstrutura(musicaId?: string) {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const secoesKey = ['repertorio-musica-secoes', igrejaAtiva.id, musicaId];
  const arranjoKey = ['repertorio-musica-arranjo', igrejaAtiva.id, musicaId];

  const secoesQuery = useQuery({
    queryKey: secoesKey,
    enabled: !!musicaId,
    queryFn: () => RepertorioRepository.listSecoes(igrejaAtiva.id, musicaId!),
  });

  const arranjoQuery = useQuery({
    queryKey: arranjoKey,
    enabled: !!musicaId,
    queryFn: () => RepertorioRepository.getArranjo(igrejaAtiva.id, musicaId!),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: secoesKey });
    await queryClient.invalidateQueries({ queryKey: arranjoKey });
    await queryClient.invalidateQueries({ queryKey: ['repertorio-musicas', igrejaAtiva.id] });
  };

  const createSecao = useMutation({
    mutationFn: (dto: CreateRepertorioMusicaSecaoDto) => RepertorioRepository.createSecao(igrejaAtiva.id, musicaId!, dto),
    onSuccess: invalidate,
  });

  const updateSecao = useMutation({
    mutationFn: ({ secaoId, dto }: { secaoId: string; dto: UpdateRepertorioMusicaSecaoDto }) =>
      RepertorioRepository.updateSecao(igrejaAtiva.id, musicaId!, secaoId, dto),
    onSuccess: invalidate,
  });

  const deleteSecao = useMutation({
    mutationFn: (secaoId: string) => RepertorioRepository.removeSecao(igrejaAtiva.id, musicaId!, secaoId),
    onSuccess: invalidate,
  });

  const replaceArranjo = useMutation({
    mutationFn: (dto: UpsertRepertorioMusicaArranjoDto) => RepertorioRepository.replaceArranjo(igrejaAtiva.id, musicaId!, dto),
    onSuccess: invalidate,
  });

  return {
    secoes: secoesQuery.data ?? [],
    arranjo: arranjoQuery.data ?? [],
    isLoading: secoesQuery.isLoading || arranjoQuery.isLoading,
    refetch: async () => {
      await secoesQuery.refetch();
      await arranjoQuery.refetch();
    },
    criarSecao: createSecao.mutateAsync,
    atualizarSecao: updateSecao.mutateAsync,
    removerSecao: deleteSecao.mutateAsync,
    substituirArranjo: replaceArranjo.mutateAsync,
    isMutating:
      createSecao.isPending || updateSecao.isPending || deleteSecao.isPending || replaceArranjo.isPending,
  };
}
