import { EscalaRepository } from "../domain/services/EscalaRepository";
import { Operator, ValueType } from "../domain/utils/query_utils";
import { useCrud } from "./useCrud";

export function useEscalasCrud() {
  return useCrud({
    queryKey: 'escalas',
    autoFetch: false,
    // initialParams: options?.initialParams,
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
    add: data => EscalaRepository.add(data),
    update: (id, data) => EscalaRepository.update(id, data),
    remove: id => EscalaRepository.remove(id),
    // resolver: zodResolver(ministerioSchema),
  });
}
