import { IndisponibilidadesVoluntarioRepository } from '../domain/services/IndisponibilidadesVoluntariosRepository';
import { useCrud, UseCrudOptions } from './useCrud';

export function useIndisponibilidadesVoluntariosCrud(
  props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams'> = {}
) {
  return useCrud({
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
