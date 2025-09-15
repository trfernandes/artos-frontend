import { MinisterioVoluntariosRepository } from '../domain/services/MinisterioVoluntariosRepository';
import { CrudFormMessages, useCrudForm } from './useCrudForm';

interface Props {
  messages?: CrudFormMessages;
}

export function useMinisterioVoluntarios(props?: Props) {
  return useCrudForm({
    queryKey: 'ministerio-voluntarios',
    autoFetch: false,
    fetchAll: () => MinisterioVoluntariosRepository.getAll(),
    search: query => MinisterioVoluntariosRepository.search(query),
    add: data => {
      console.log('add', data);
      return MinisterioVoluntariosRepository.add(data);
    },
    update: (id, data) => {
      console.log('update', id, data);
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
  });
}
