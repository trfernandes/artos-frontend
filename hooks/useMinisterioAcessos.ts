import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MinisterioAcessosRepository } from '../domain/services/MinisterioAcessosRepository';
import { UpsertMinisterioAuxiliarDto } from '../domain/dtos/MinisterioAcesso/ministerio-acesso.upsert';

export function useMinisterioAcessos(igrejaId?: string, ministerioId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['ministerio-acessos', igrejaId, ministerioId];

  const query = useQuery({
    queryKey,
    enabled: !!igrejaId && !!ministerioId,
    queryFn: () => MinisterioAcessosRepository.getAcessos(igrejaId!, ministerioId!),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey, exact: true });
  };

  const addAuxiliar = useMutation({
    mutationFn: (dto: UpsertMinisterioAuxiliarDto) =>
      MinisterioAcessosRepository.addAuxiliar(igrejaId!, ministerioId!, dto),
    onSuccess: invalidate,
  });

  const updateAuxiliar = useMutation({
    mutationFn: ({
      voluntarioId,
      permissoes,
    }: {
      voluntarioId: string;
      permissoes: UpsertMinisterioAuxiliarDto['permissoes'];
    }) =>
      MinisterioAcessosRepository.updateAuxiliar(igrejaId!, ministerioId!, voluntarioId, {
        permissoes,
      }),
    onSuccess: invalidate,
  });

  const removeAuxiliar = useMutation({
    mutationFn: (ministerioVoluntarioId: string) =>
      MinisterioAcessosRepository.removeAuxiliar(igrejaId!, ministerioId!, ministerioVoluntarioId),
    onSuccess: invalidate,
  });

  return {
    ...query,
    addAuxiliar: addAuxiliar.mutateAsync,
    updateAuxiliar: updateAuxiliar.mutateAsync,
    removeAuxiliar: removeAuxiliar.mutateAsync,
    isLoadingMutation:
      addAuxiliar.isPending || updateAuxiliar.isPending || removeAuxiliar.isPending,
  };
}
