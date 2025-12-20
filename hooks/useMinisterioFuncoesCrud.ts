import { MinisterioFuncoesRepository } from '../domain/services/MinisterioFuncoesRepository';
import { useCrud, UseCrudOptions } from './useCrud';

export function useMinisterioFuncoesCrud(
  props: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams' | 'messages'> = {}
) {
  return useCrud({
    queryKey: 'ministerio-funcoes',
    autoFetch: false,
    fetchAll: () => MinisterioFuncoesRepository.getAll(),
    search: query => MinisterioFuncoesRepository.search(query),
    add: data => {
      return MinisterioFuncoesRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioFuncoesRepository.update(id, data);
    },
    remove: id => MinisterioFuncoesRepository.remove(id),
    messages: props?.messages || {
      successCreate: 'Função adicionada com sucesso!',
      errorCreate: 'Erro ao adicionar função.',
      successUpdate: 'Função atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar função.',
      successDelete: 'Função excluída com sucesso!',
      errorDelete: 'Erro ao excluir função.',
    },
    ...props,
  });
}
