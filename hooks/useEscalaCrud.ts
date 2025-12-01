import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { EscalaRepository } from '../domain/services/EscalaRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { useCrud, UseCrudOptions } from './useCrud';
import { GerarEscalaDto } from '../domain/api/EscalaApi';

export function useEscalasCrud(props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams'> = {}) {
  const crud = useCrud({
    queryKey: 'escalas',
    autoFetch: false,
    fetchAll: () => EscalaRepository.getAll(),
    search: query => EscalaRepository.search(query),
    fetchOne: async id => {
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
    ...props,
    add: data => EscalaRepository.add(data),
    update: (id, data) => EscalaRepository.update(id, data),
    remove: id => EscalaRepository.remove(id),
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
    mutationFn: (data: GerarEscalaDto) => EscalaRepository.generate(data),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Escala gerada com sucesso!' });
      crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: error => {
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
