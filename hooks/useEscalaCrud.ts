import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { EscalaRepository } from '../domain/services/EscalaRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { ResponseEscalaDto } from '../domain/dtos/Escala/escala.response';
import { CreateEscalaDto } from '../domain/dtos/Escala/escala.create';
import { UpdateEscalaDto } from '../domain/dtos/Escala/escala.update';
import { EscalaFormData } from '../domain/schemas/escalaSchema';

export function useEscalasCrud({ autoFetch = false, initialParams = undefined }: ExternalUseCrudParams = {}) {
  const crud = useCrud<ResponseEscalaDto, EscalaFormData, CreateEscalaDto, UpdateEscalaDto>({
    queryKey: 'escalas',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaRepository.getAll(),
    search: (query) => EscalaRepository.search(query),
    fetchOne: async (id) => {
      const result = await EscalaRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
        relations: [],
      });
      return result[0];
    },

    add: (data) => EscalaRepository.add(data),
    update: (id, data) => EscalaRepository.update(id, data),
    remove: (id) => EscalaRepository.remove(id),
    messages: {
      successCreate: 'Escala criada com sucesso!',
      errorCreate: 'Erro ao criar escala.',
      successUpdate: 'Escala atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar escala.',
      successDelete: 'Escala removida com sucesso!',
      errorDelete: 'Erro ao remover escala.',
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: CreateEscalaDto) => EscalaRepository.generate(data),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Escala gerada com sucesso!' });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: (error) => {
      Toast.show({ type: 'error', text1: 'Erro ao gerar escala.' });
      console.log(error);
    },
  });

  return {
    ...crud,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
