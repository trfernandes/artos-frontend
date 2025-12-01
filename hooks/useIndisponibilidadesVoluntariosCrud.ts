import { IndisponibilidadesVoluntarioRepository } from '../domain/services/IndisponibilidadesVoluntariosRepository';
import { useCrud, UseCrudOptions } from './useCrud';
import { UpsertIndisponibilidadesVoluntarioPayload } from '../domain/models/IndisponibilidadeVoluntario';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export function useIndisponibilidadesVoluntariosCrud(
  props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams' | 'messages'> = {}
) {
  const crud = useCrud({
    ...props,
    queryKey: 'indisponibilidades-voluntarios',
    autoFetch: props.autoFetch || false,
    fetchAll: () => IndisponibilidadesVoluntarioRepository.getAll(),
    search: query => IndisponibilidadesVoluntarioRepository.search(query),
    add: data => {
      return IndisponibilidadesVoluntarioRepository.add(data);
    },
    update: (id, data) => {
      return IndisponibilidadesVoluntarioRepository.update(id, data);
    },
    remove: id => IndisponibilidadesVoluntarioRepository.remove(id),
    messages: props.messages || {
      successDelete: 'Indisponibilidade removida com sucesso.',
      successCreate: 'Indisponibilidade criada com sucesso.',
      errorDelete: 'Erro ao remover a indisponibilidade.',
      errorCreate: 'Erro ao criar a indisponibilidade.',
      errorUpdate: 'Erro ao atualizar a indisponibilidade.',
    },
  });

  const upsertMany = useMutation({
    mutationFn: (payload: UpsertIndisponibilidadesVoluntarioPayload) =>
      IndisponibilidadesVoluntarioRepository.upsertMany(payload),
    onSuccess: () => {
      crud.messages?.successUpdate &&
        Toast.show({ type: 'success', text1: crud.messages?.successUpdate || 'Item atualizado com sucesso!' });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: error => {
      crud.messages?.errorUpdate &&
        Toast.show({ type: 'error', text1: crud.messages?.errorUpdate || 'Erro ao atualizar item.' });
      console.log(error);
    },
  });

  return {
    ...crud,
    upsertMany: upsertMany.mutateAsync,
    isLoadingMutation: crud.isLoadingMutation || upsertMany.isPending,
  };
}
