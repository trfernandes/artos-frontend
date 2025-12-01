import { EscalaSubstituicoesRepository } from '../domain/services/EscalaSubstituicoesRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { useCrud, UseCrudOptions } from './useCrud';

export function useEscalaSubstituicoesCrud(props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams'> = {}) {
  const crud = useCrud({
    queryKey: 'escalas-substituicoes',
    autoFetch: false,
    fetchAll: () => EscalaSubstituicoesRepository.getAll(),
    search: query => EscalaSubstituicoesRepository.search(query),
    fetchOne: async id => {
      const result = await EscalaSubstituicoesRepository.search({
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
    add: data => EscalaSubstituicoesRepository.add(data),
    update: (id, data) => EscalaSubstituicoesRepository.update(id, data),
    remove: id => EscalaSubstituicoesRepository.remove(id),
  });

  return {
    ...crud,
  };
}
