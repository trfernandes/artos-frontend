import { EscalaItensRepository } from '../domain/services/EscalaItensRepository';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { useCrud } from './useCrud';

export function useEscalaItensCrud({
  autoFetch = false,
  initialParams = undefined,
  includeFotos = false,
}: {
  autoFetch?: boolean;
  initialParams?: DynamicQuery;
  includeFotos?: boolean;
} = {}) {
  const crud = useCrud({
    queryKey: 'escalas-itens',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaItensRepository.getAll(),
    search: query => EscalaItensRepository.search(query, includeFotos),
    fetchOne: async id => {
      const result = await EscalaItensRepository.search({
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
    add: data => EscalaItensRepository.add(data),
    update: (id, data) => EscalaItensRepository.update(id, data),
    remove: id => EscalaItensRepository.remove(id),
  });

  return {
    ...crud,
  };
}
