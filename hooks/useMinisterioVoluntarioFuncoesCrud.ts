import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { MinisterioVoluntarioFuncoesRepository } from '../domain/services/MinisterioVoluntarioFuncoesRepository';
import { useCrud, UseCrudOptions } from './useCrud';

type UpdateFuncoesArgs = Parameters<typeof MinisterioVoluntarioFuncoesRepository.updateFuncoes>;

type UpdateFuncoesPayload = {
  ministerioVoluntarioId: UpdateFuncoesArgs[0];
  data: UpdateFuncoesArgs[1];
};

export function useMinisterioVoluntarioFuncoesCrud(
  props?: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams' | 'messages'>
) {
  const crud = useCrud({
    queryKey: 'ministerio-voluntario-funcoes',
    fetchAll: () => MinisterioVoluntarioFuncoesRepository.getAll(),
    search: query => MinisterioVoluntarioFuncoesRepository.search(query),
    add: data => {
      return MinisterioVoluntarioFuncoesRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioVoluntarioFuncoesRepository.update(id, data);
    },
    remove: id => MinisterioVoluntarioFuncoesRepository.remove(id),
    messages: props?.messages || {
      successCreate: 'Função adicionada com sucesso!',
      errorCreate: 'Erro ao adicionar função.',
      successUpdate: 'Função atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar função.',
      successDelete: 'Função excluída com sucesso!',
      errorDelete: 'Erro ao excluir função.',
    },
    ...props,
  });

  const updateFuncoesMutation = useMutation({
    mutationFn: ({ ministerioVoluntarioId, data }: UpdateFuncoesPayload) =>
      MinisterioVoluntarioFuncoesRepository.updateFuncoes(ministerioVoluntarioId, data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: crud.messages?.successUpdate || 'Funcoes atualizadas com sucesso!',
      });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: error => {
      Toast.show({
        type: 'error',
        text1: crud.messages?.errorUpdate || 'Erro ao atualizar funcoes.',
      });
      console.log(error);
    },
  });

  const updateFuncoes = useCallback(
    (ministerioVoluntarioId: UpdateFuncoesArgs[0], data: UpdateFuncoesArgs[1]) =>
      updateFuncoesMutation.mutateAsync({ ministerioVoluntarioId, data }),
    [updateFuncoesMutation]
  );

  const isLoadingMutation = crud.isLoadingMutation || updateFuncoesMutation.isPending;
  const isError = crud.isError || updateFuncoesMutation.isError;
  const error = crud.error ?? updateFuncoesMutation.error ?? null;

  return {
    ...crud,
    updateFuncoes,
    isUpdatingFuncoes: updateFuncoesMutation.isPending,
    isLoadingMutation,
    isError,
    error,
  };
}
