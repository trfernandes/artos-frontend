import { EscalaResultadosRepository } from '../domain/services/EscalaResultadosRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { useCrud, UseCrudOptions } from './useCrud';

export function useEscalaResultadosCrud(props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams'> = {}) {
  const crud = useCrud({
    queryKey: 'escalas-resultados',
    autoFetch: false,
    fetchAll: () => EscalaResultadosRepository.getAll(),
    search: query => EscalaResultadosRepository.search(query),
    fetchOne: async id => {
      const result = await EscalaResultadosRepository.search({
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
    add: data => EscalaResultadosRepository.add(data),
    update: (id, data) => EscalaResultadosRepository.update(id, data),
    remove: id => EscalaResultadosRepository.remove(id),
  });

  return {
    ...crud,
  };
}
