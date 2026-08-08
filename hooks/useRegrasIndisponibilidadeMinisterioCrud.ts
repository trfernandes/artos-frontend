import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { RegrasIndisponibilidadeMinisterioRepository } from '../domain/services/RegrasIndisponibilidadeMinisterioRepository';
import { CreateRegraIndisponibilidadeVoluntarioDto } from '../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';

export function useRegrasIndisponibilidadeMinisterioCrud(
  ministerioId?: string,
  voluntarioId?: string,
) {
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;
  const queryClient = useQueryClient();

  const enabled = Boolean(igrejaId && ministerioId && voluntarioId);
  const queryKey = ['regras-indisponibilidade-ministerio', igrejaId, ministerioId, voluntarioId];

  const queryResult = useQuery({
    queryKey,
    enabled,
    queryFn: () =>
      RegrasIndisponibilidadeMinisterioRepository.listar(igrejaId!, ministerioId!, voluntarioId!),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const criarMutation = useMutation({
    mutationFn: (dto: CreateRegraIndisponibilidadeVoluntarioDto) =>
      RegrasIndisponibilidadeMinisterioRepository.criar(igrejaId!, ministerioId!, voluntarioId!, dto),
    onSuccess: invalidate,
  });

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRegraIndisponibilidadeVoluntarioDto }) =>
      RegrasIndisponibilidadeMinisterioRepository.atualizar(
        igrejaId!,
        ministerioId!,
        voluntarioId!,
        id,
        dto,
      ),
    onSuccess: invalidate,
  });

  const removerMutation = useMutation({
    mutationFn: (id: string) =>
      RegrasIndisponibilidadeMinisterioRepository.remover(
        igrejaId!,
        ministerioId!,
        voluntarioId!,
        id,
      ),
    onSuccess: invalidate,
  });

  return {
    pessoais: queryResult.data?.pessoais ?? [],
    ministerio: queryResult.data?.ministerio ?? [],
    isLoading: queryResult.isLoading,
    isRefetching: queryResult.isRefetching,
    isError: queryResult.isError,
    refetch: queryResult.refetch,
    criarRegra: criarMutation.mutateAsync,
    atualizarRegra: atualizarMutation.mutateAsync,
    removerRegra: removerMutation.mutateAsync,
    isLoadingMutation:
      criarMutation.isPending || atualizarMutation.isPending || removerMutation.isPending,
  };
}
