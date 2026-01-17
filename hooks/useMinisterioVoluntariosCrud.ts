import { CreateMinisterioVoluntarioDto } from '../domain/dtos/MinisterioVoluntario/ministerio-voluntario.create';
import { ResponseMinisterioVoluntarioDto } from '../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { UpdateMinisterioVoluntarioDto } from '../domain/dtos/MinisterioVoluntario/ministerio-voluntario.update';
import { MinisterioVoluntariosRepository } from '../domain/services/MinisterioVoluntariosRepository';
import { ExternalUseCrudParams, useCrud } from './useCrud';

export function useMinisterioVoluntariosCrud({ autoFetch = false, initialParams, muteMessages }: ExternalUseCrudParams = {}) {
  return useCrud<ResponseMinisterioVoluntarioDto, any, CreateMinisterioVoluntarioDto, UpdateMinisterioVoluntarioDto>({
    initialParams,
    autoFetch,
    queryKey: 'ministerio-voluntarios',
    fetchAll: () => MinisterioVoluntariosRepository.getAll(),
    search: (query) => MinisterioVoluntariosRepository.search(query),
    add: (data) => {
      return MinisterioVoluntariosRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioVoluntariosRepository.update(id, data);
    },
    remove: (id) => MinisterioVoluntariosRepository.remove(id),
    muteMessages,
    messages: {
      successCreate: 'Voluntário adicionado com sucesso!',
      errorCreate: 'Erro ao adicionar voluntário.',
      successUpdate: 'Voluntário atualizado com sucesso!',
      errorUpdate: 'Erro ao atualizar voluntário.',
      successDelete: 'Voluntário excluido com sucesso!',
      errorDelete: 'Erro ao excluir voluntário.',
    },
  });
}
