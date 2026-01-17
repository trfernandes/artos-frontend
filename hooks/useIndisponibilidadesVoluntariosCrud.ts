import { ExternalUseCrudParams, useCrud } from './useCrud';

import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { IndisponibilidadesVoluntariosRepository } from '../domain/services/IndisponibilidadesVoluntariosRepository';
import { ResponseIndisponibilidadeVoluntarioDto } from '../domain/dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.response';
import { CreateIndisponibilidadeVoluntarioDto } from '../domain/dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.create';
import { UpdateIndisponibilidadeVoluntarioDto } from '../domain/dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.update';
import { UpsertIndisponibilidadesVoluntarioDto } from '../domain/dtos/IndisponibilidadeVoluntario/upsert-indisponibilidades-voluntario.dto';

export function useIndisponibilidadesVoluntariosCrud({ autoFetch = false, initialParams = {} }: ExternalUseCrudParams = {}) {
  const crud = useCrud<
    ResponseIndisponibilidadeVoluntarioDto,
    any,
    CreateIndisponibilidadeVoluntarioDto,
    UpdateIndisponibilidadeVoluntarioDto
  >({
    queryKey: 'indisponibilidades-voluntarios',
    autoFetch,
    initialParams,
    fetchAll: () => IndisponibilidadesVoluntariosRepository.getAll(),
    search: (query) => IndisponibilidadesVoluntariosRepository.search(query),
    add: (data) => {
      return IndisponibilidadesVoluntariosRepository.add(data);
    },
    update: (id, data) => {
      return IndisponibilidadesVoluntariosRepository.update(id, data);
    },
    remove: (id) => IndisponibilidadesVoluntariosRepository.remove(id),
    messages: {
      successDelete: 'Indisponibilidade removida com sucesso.',
      successCreate: 'Indisponibilidade criada com sucesso.',
      errorDelete: 'Erro ao remover a indisponibilidade.',
      errorCreate: 'Erro ao criar a indisponibilidade.',
      errorUpdate: 'Erro ao atualizar a indisponibilidade.',
    },
  });

  const upsertMany = useMutation({
    mutationFn: (payload: UpsertIndisponibilidadesVoluntarioDto) => IndisponibilidadesVoluntariosRepository.upsertMany(payload),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Item atualizado com sucesso!',
      });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar item.',
      });
      console.log(error);
    },
  });

  return {
    ...crud,
    upsertMany: upsertMany.mutateAsync,
    isLoadingMutation: crud.isLoadingMutation || upsertMany.isPending,
  };
}
