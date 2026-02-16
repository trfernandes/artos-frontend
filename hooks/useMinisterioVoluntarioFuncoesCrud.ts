import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { MinisterioVoluntarioFuncoesRepository } from '../domain/services/MinisterioVoluntarioFuncoesRepository';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { ResponseMinisterioVoluntarioFuncaoDto } from '../domain/dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.response';
import { CreateMinisterioVoluntarioFuncaoDto } from '../domain/dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.create';
import { UpdateMinisterioVoluntarioFuncaoDto } from '../domain/dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.update';

type UpdateFuncoesArgs = Parameters<typeof MinisterioVoluntarioFuncoesRepository.updateFuncoes>;

type UpdateFuncoesPayload = {
  ministerioVoluntarioId: UpdateFuncoesArgs[0];
  data: UpdateFuncoesArgs[1];
};

export function useMinisterioVoluntarioFuncoesCrud({ autoFetch = false, initialParams = {} }: ExternalUseCrudParams = {}) {
  const crud = useCrud<
    ResponseMinisterioVoluntarioFuncaoDto,
    any,
    CreateMinisterioVoluntarioFuncaoDto,
    UpdateMinisterioVoluntarioFuncaoDto
  >({
    autoFetch,
    initialParams,
    queryKey: 'ministerio-voluntario-funcoes',
    fetchAll: () => MinisterioVoluntarioFuncoesRepository.getAll(),
    search: (query) => MinisterioVoluntarioFuncoesRepository.search(query),
    add: (data) => {
      return MinisterioVoluntarioFuncoesRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioVoluntarioFuncoesRepository.update(id, data);
    },
    remove: (id) => MinisterioVoluntarioFuncoesRepository.remove(id),
    messages: {
      successCreate: 'Função adicionada com sucesso!',
      errorCreate: 'Erro ao adicionar função.',
      successUpdate: 'Função atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar função.',
      successDelete: 'Função excluída com sucesso!',
      errorDelete: 'Erro ao excluir função.',
    },
  });

  const updateFuncoesMutation = useMutation({
    mutationFn: ({ ministerioVoluntarioId, data }: UpdateFuncoesPayload) =>
      MinisterioVoluntarioFuncoesRepository.updateFuncoes(ministerioVoluntarioId, data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Funções atualizadas com sucesso!',
      });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar funcoes.',
      });
      console.log(error);
    },
  });

  const updateFuncoes = useCallback(
    (ministerioVoluntarioId: UpdateFuncoesArgs[0], data: UpdateFuncoesArgs[1]) =>
      updateFuncoesMutation.mutateAsync({ ministerioVoluntarioId, data }),
    [updateFuncoesMutation],
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
