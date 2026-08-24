import { ExternalUseCrudParams, useCrud } from './useCrud';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { VoluntariosRepository } from '../domain/services/VoluntariosRepository';
import { CreateVoluntarioDto } from '../domain/dtos/Voluntario/voluntario.create';
import { UpdateVoluntarioDto } from '../domain/dtos/Voluntario/voluntario.update';
import { ResponseVoluntarioDto } from '../domain/dtos/Voluntario/voluntario.response';

export function useVoluntariosCrud({
  autoFetch = false,
  initialParams = {},
  igrejaId,
}: ExternalUseCrudParams & { igrejaId?: string } = {}) {
  return useCrud<ResponseVoluntarioDto, any, CreateVoluntarioDto, UpdateVoluntarioDto>({
    queryKey: 'voluntarios',
    autoFetch,
    initialParams,
    fetchAll: () => VoluntariosRepository.getAll(),
    // POST /voluntarios/search exige igrejaId como query param (escopo por igreja) —
    // sem ele o backend rejeita com 400 e a busca volta vazia.
    search: (query) => VoluntariosRepository.search(query, igrejaId),
    fetchOne: async (id) => {
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
    add: (data) => VoluntariosRepository.add(data),
    update: (id, data) => {
      return VoluntariosRepository.update(id, data);
    },
    remove: (id) => VoluntariosRepository.remove(id),
    messages: {
      successCreate: 'Usuário criado com sucesso',
      successUpdate: 'Perfil atualizado com sucesso',
    },
  });
}
