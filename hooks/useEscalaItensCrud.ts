import { CreateEscalaItemDto } from '../domain/dtos/Escala/escala-item.create';
import { ResponseEscalaItemDto } from '../domain/dtos/Escala/escala-item.response';
import { UpdateEscalaItemDto } from '../domain/dtos/Escala/escala-item.update';
import { EscalaItensRepository } from '../domain/services/EscalaItensRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { useAuth } from '../contexts/AuthContext';

export function useEscalaItensCrud({
  autoFetch = false,
  initialParams = undefined,
  includeFotos = false,
  muteMessages = false,
  messages,
}: ExternalUseCrudParams & {
  includeFotos?: boolean;
} = {}) {
  const { igrejaAtiva } = useAuth();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  const crud = useCrud<ResponseEscalaItemDto, any, CreateEscalaItemDto, UpdateEscalaItemDto>({
    queryKey: 'escalas-itens',
    autoFetch,
    initialParams,
    muteMessages,
    messages,
    fetchAll: () => EscalaItensRepository.getAll(),
    search: (query) =>
      EscalaItensRepository.search({ ...query, igrejaId: igrejaAtiva.id }, includeFotos),
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
    add: (data) => EscalaItensRepository.add({ ...data, igrejaId: igrejaAtiva.id } as any),
    update: (id, data) =>
      EscalaItensRepository.update(id, { ...data, igrejaId: igrejaAtiva.id } as any),
    remove: (id) => EscalaItensRepository.removeWithIgrejaId(id, igrejaAtiva.id),
  });

  return {
    ...crud,
  };
}
