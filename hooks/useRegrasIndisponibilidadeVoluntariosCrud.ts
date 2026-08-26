import { ExternalUseCrudParams, useCrud } from './useCrud';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { RegrasIndisponibilidadeVoluntariosRepository } from '../domain/services/RegrasIndisponibilidadeVoluntariosRepository';
import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { CreateRegraIndisponibilidadeVoluntarioDto } from '../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';
import { useAuth } from '../contexts/AuthContext';

export function useRegrasIndisponibilidadeVoluntariosCrud({
  autoFetch = false,
  initialParams,
  muteMessages = false,
}: ExternalUseCrudParams = {}) {
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;

  const crud = useCrud<
    ResponseRegraIndisponibilidadeVoluntarioDto,
    any,
    CreateRegraIndisponibilidadeVoluntarioDto,
    UpdateRegraIndisponibilidadeVoluntarioDto
  >({
    queryKey: 'regras-indisponibilidade-voluntarios',
    autoFetch,
    initialParams,
    muteMessages,
    enabled: !!igrejaId,
    fetchAll: () => RegrasIndisponibilidadeVoluntariosRepository.getAll(),
    search: (query) =>
      RegrasIndisponibilidadeVoluntariosRepository.search(
        igrejaId ? { ...query, igrejaId } : query,
      ),
    add: (data) => RegrasIndisponibilidadeVoluntariosRepository.add(data),
    update: (id, data) => RegrasIndisponibilidadeVoluntariosRepository.update(id, data, igrejaId),
    remove: (id) => RegrasIndisponibilidadeVoluntariosRepository.remove(id),
    messages: {
      successDelete: 'Regra removida com sucesso.',
      successCreate: 'Regra criada com sucesso.',
      errorDelete: 'Erro ao remover a regra.',
      errorCreate: 'Erro ao criar a regra.',
      errorUpdate: 'Erro ao atualizar a regra.',
    },
  });

  const removeWithIgreja = useMutation({
    mutationFn: ({ id, igrejaId: igId }: { id: string; igrejaId: string }) =>
      RegrasIndisponibilidadeVoluntariosRepository.remove(id, igId),
    onSuccess: async () => {
      if (!muteMessages) {
        Toast.show({ type: 'success', text1: 'Regra removida com sucesso.' });
      }
      await crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: () => {
      if (!muteMessages) {
        Toast.show({ type: 'error', text1: 'Erro ao remover a regra.' });
      }
    },
  });

  return {
    ...crud,
    removeWithIgreja: removeWithIgreja.mutateAsync,
    isLoadingMutation: crud.isLoadingMutation || removeWithIgreja.isPending,
  };
}
