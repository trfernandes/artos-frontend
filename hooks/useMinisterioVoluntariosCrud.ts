import { MinisterioVoluntariosRepository } from '../domain/services/MinisterioVoluntariosRepository';
import { useCrud, UseCrudOptions } from './useCrud';

export function useMinisterioVoluntariosCrud(
  props?: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams' | 'messages'>
) {
  return useCrud({
    queryKey: 'ministerio-voluntarios',
    fetchAll: () => MinisterioVoluntariosRepository.getAll(),
    search: query => MinisterioVoluntariosRepository.search(query),
    add: data => {
      return MinisterioVoluntariosRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioVoluntariosRepository.update(id, data);
    },
    remove: id => MinisterioVoluntariosRepository.remove(id),
    messages: props?.messages || {
      successCreate: 'Voluntário adicionado com sucesso!',
      errorCreate: 'Erro ao adicionar voluntário.',
      successUpdate: 'Voluntário atualizado com sucesso!',
      errorUpdate: 'Erro ao atualizar voluntário.',
      successDelete: 'Voluntário excluido com sucesso!',
      errorDelete: 'Erro ao excluir voluntário.',
    },
    ...props,
  });
}
