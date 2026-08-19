import { MinisteriosRepository } from '../domain/services/MinisteriosRepository';
import { IgrejaMinisteriosRepository } from '../domain/services/IgrejaMinisteriosRepository';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponseMinisterioDto } from '../domain/dtos/Ministerio/ministerio.response';
import { CreateMinisterioDto } from '../domain/dtos/Ministerio/ministerio.create';
import { UpdateMinisterioDto } from '../domain/dtos/Ministerio/ministerio.update';
import {
  AddMinisterioFormData,
  AddMinisterioSchema,
} from '../domain/schemas/ministerioAdminSchema';
import { useAuth } from '../contexts/AuthContext';

export function useMinisteriosCrud({
  autoFetch = false,
  initialParams = {},
  muteMessages,
}: ExternalUseCrudParams = {}) {
  const { igrejaAtiva } = useAuth();

  return useCrud<
    ResponseMinisterioDto,
    AddMinisterioFormData,
    CreateMinisterioDto,
    UpdateMinisterioDto
  >({
    queryKey: 'ministerios',
    autoFetch,
    initialParams,
    enabled: !!igrejaAtiva,
    fetchAll: () => IgrejaMinisteriosRepository.listarMinisterios(igrejaAtiva!.id),
    search: (query) => IgrejaMinisteriosRepository.listarMinisterios(igrejaAtiva!.id, query),
    fetchOne: async (id) => {
      const result = await IgrejaMinisteriosRepository.listarMinisterios(igrejaAtiva!.id, {
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
    add: (data) => MinisteriosRepository.add(data),
    update: (id, data) => MinisteriosRepository.update(id, { ...data, igrejaId: igrejaAtiva!.id }),
    remove: (id) => MinisteriosRepository.remove(id, igrejaAtiva!.id),
    resolver: zodResolver(AddMinisterioSchema),
    muteMessages,
    messages: {
      errorCreate: 'Erro ao criar ministério.',
      errorUpdate: 'Erro ao atualizar ministério.',
      errorDelete: 'Erro ao deletar ministério.',
      successCreate: 'Ministério criado com sucesso.',
      successUpdate: 'Ministério atualizado com sucesso.',
      successDelete: 'Ministério deletado com sucesso.',
    },
  });
}
