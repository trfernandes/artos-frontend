import { IndisponibilidadesVoluntarioRepository } from '../domain/services/IndisponibilidadesVoluntariosRepository';
import { useCrudForm, UseCrudFormOptions } from './useCrudForm';

export function useIndisponibilidadesVoluntariosForm(
  props: Pick<UseCrudFormOptions<any, any>, 'autoFetch' | 'initialParams'> = {}
) {
  return useCrudForm({
    ...props,
    queryKey: 'indisponibilidades-voluntarios',
    autoFetch: props.autoFetch || false,
    fetchAll: () => IndisponibilidadesVoluntarioRepository.getAll(),
    search: query => IndisponibilidadesVoluntarioRepository.search(query),
    add: data => {
      return IndisponibilidadesVoluntarioRepository.add(data);
    },
    update: (id, data) => {
      return IndisponibilidadesVoluntarioRepository.update(id, data);
    },
    remove: id => IndisponibilidadesVoluntarioRepository.remove(id),
    messages: {
      successDelete: 'Indisponibilidade removida com sucesso.',
      successCreate: 'Indisponibilidade criada com sucesso.',
      errorDelete: 'Erro ao remover a indisponibilidade.',
      errorCreate: 'Erro ao criar a indisponibilidade.',
      errorUpdate: 'Erro ao atualizar a indisponibilidade.',
    },
  });
}
