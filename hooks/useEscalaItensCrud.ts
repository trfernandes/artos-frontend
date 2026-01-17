import { CreateEscalaItemDto } from '../domain/dtos/Escala/escala-item.create';
import { ResponseEscalaItemDto } from '../domain/dtos/Escala/escala-item.response';
import { UpdateEscalaItemDto } from '../domain/dtos/Escala/escala-item.update';
import { EscalaItensRepository } from '../domain/services/EscalaItensRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { ExternalUseCrudParams, useCrud } from './useCrud';

export function useEscalaItensCrud({
  autoFetch = false,
  initialParams = undefined,
  includeFotos = false,
}: ExternalUseCrudParams & {
  includeFotos?: boolean;
} = {}) {
  const crud = useCrud<ResponseEscalaItemDto, any, CreateEscalaItemDto, UpdateEscalaItemDto>({
    queryKey: 'escalas-itens',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaItensRepository.getAll(),
    search: (query) => EscalaItensRepository.search(query, includeFotos),
    fetchOne: async (id) => {
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
    add: (data) => EscalaItensRepository.add(data),
    update: (id, data) => EscalaItensRepository.update(id, data),
    remove: (id) => EscalaItensRepository.remove(id),
  });

  return {
    ...crud,
  };
}
