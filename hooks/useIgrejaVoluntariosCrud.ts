import { ExternalUseCrudParams, useCrud } from './useCrud';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';
import { ResponseVoluntarioIgrejaDto } from '../domain/dtos/Voluntario/response-voluntario-igreja.dto';
import { useAuth } from '../contexts/AuthContext';

export function useIgrejaVoluntariosCrud({
  autoFetch = false,
  initialParams = {},
}: ExternalUseCrudParams = {}) {
  const { igrejaAtiva } = useAuth();

  return useCrud<ResponseVoluntarioIgrejaDto, any, any, any>({
    queryKey: 'igreja-voluntarios',
    autoFetch,
    initialParams,
    enabled: !!igrejaAtiva,
    fetchAll: () => IgrejaRepository.listarVoluntarios(igrejaAtiva!.id),
    search: (query) => IgrejaRepository.listarVoluntarios(igrejaAtiva!.id, query),
    fetchOne: undefined,
    remove: (voluntarioId: string) =>
      IgrejaRepository.removerVoluntario(igrejaAtiva!.id, voluntarioId),
    messages: {
      successDelete: 'Voluntário excluído com sucesso!',
      errorDelete: 'Erro ao excluir voluntário.',
    },
  });
}
