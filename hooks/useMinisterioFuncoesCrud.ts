import { CreateMinisterioFuncaoDto } from '../domain/dtos/MinisterioFuncao/ministerio-funcao.create';
import { ResponseMinisterioFuncaoDto } from '../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { UpdateMinisterioFuncaoDto } from '../domain/dtos/MinisterioFuncao/ministerio-funcao.update';
import { MinisterioFuncoesRepository } from '../domain/services/MinisterioFuncoesRepository';
import { ExternalUseCrudParams, useCrud } from './useCrud';

export function useMinisterioFuncoesCrud({
  autoFetch = false,
  initialParams = {},
}: ExternalUseCrudParams) {
  return useCrud<
    ResponseMinisterioFuncaoDto,
    any,
    CreateMinisterioFuncaoDto,
    UpdateMinisterioFuncaoDto
  >({
    queryKey: 'ministerio-funcoes',
    autoFetch,
    initialParams,
    fetchAll: () => MinisterioFuncoesRepository.getAll(),
    search: (query) => MinisterioFuncoesRepository.search(query),
    add: (data) => {
      return MinisterioFuncoesRepository.add(data);
    },
    update: (id, data) => {
      return MinisterioFuncoesRepository.update(id, data);
    },
    remove: (id) => MinisterioFuncoesRepository.remove(id),
    messages: {
      successCreate: 'Função adicionada com sucesso!',
      errorCreate: 'Erro ao adicionar função.',
      successUpdate: 'Função atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar função.',
      successDelete: 'Função excluída com sucesso!',
      errorDelete: 'Erro ao excluir função.',
    },
  });
}
