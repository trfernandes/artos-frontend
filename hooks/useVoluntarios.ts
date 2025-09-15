import { useCrudForm } from './useCrudForm';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { VoluntariosRepository } from '../domain/services/VoluntariosRepository';

interface UseVoluntariosOptions {
  autoFetch?: boolean;
  initialParams?: DynamicQuery | string;
}

export function useVoluntarios(options?: UseVoluntariosOptions) {
  return useCrudForm({
    queryKey: 'voluntarios',
    autoFetch: options?.autoFetch ?? true,
    initialParams: options?.initialParams,
    fetchAll: () => VoluntariosRepository.search({ relations: ['ministerios.ministerio'] }),
    search: query => VoluntariosRepository.search(query),
    fetchOne: async id => {
      const result = await VoluntariosRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
        relations: ['voluntarios', 'voluntarios.voluntario', 'voluntarios.permissoes'],
      });
      return result[0];
    },
    add: data => VoluntariosRepository.add(data),
    update: (id, data) => {
      return VoluntariosRepository.update(id, data);
    },
    remove: id => VoluntariosRepository.remove(id),
  });
}
