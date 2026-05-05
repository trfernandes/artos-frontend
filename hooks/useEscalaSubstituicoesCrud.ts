import { CreateEscalaSubstituicaoDto } from '../domain/dtos/Escala/escala-substituicao.create';
import { ResponseEscalaSubstituicaoDto } from '../domain/dtos/Escala/escala-substituicao.response';
import { UpdateEscalaSubstituicaoDto } from '../domain/dtos/Escala/escala-substituicao.update';
import { EscalaSubstituicoesRepository } from '../domain/services/EscalaSubstituicoesRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { useAuth } from '../contexts/AuthContext';

export function useEscalaSubstituicoesCrud({ autoFetch, initialParams }: ExternalUseCrudParams = {}) {
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;

  const crud = useCrud<ResponseEscalaSubstituicaoDto, any, CreateEscalaSubstituicaoDto, UpdateEscalaSubstituicaoDto>({
    queryKey: 'escalas-substituicoes',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaSubstituicoesRepository.getAll(),
    search: (query) => EscalaSubstituicoesRepository.search(igrejaId ? { ...query, igrejaId } : query),
    fetchOne: async (id) => {
      const result = await EscalaSubstituicoesRepository.search({
        ...(igrejaId ? { igrejaId } : {}),
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
    add: (data) => EscalaSubstituicoesRepository.add(data),
    update: (id, data) => EscalaSubstituicoesRepository.update(id, data),
    remove: (id) => EscalaSubstituicoesRepository.remove(id),
  });

  return {
    ...crud,
  };
}
