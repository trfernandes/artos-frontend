import { ExternalUseCrudParams, useCrud } from './useCrud';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';
import { ResponseVoluntarioDto } from '../domain/dtos/Voluntario/voluntario.response';
import { useAuth } from '../contexts/AuthContext';

export function useIgrejaVoluntariosCrud({ autoFetch = false, initialParams = {} }: ExternalUseCrudParams = {}) {
  const { igrejaAtiva } = useAuth();

  if (!igrejaAtiva) {
    throw new Error('Nenhuma igreja ativa selecionada');
  }

  return useCrud<ResponseVoluntarioDto, any, any, any>({
    queryKey:'igreja-voluntarios',
    autoFetch,
    initialParams,
    fetchAll: () => IgrejaRepository.listarVoluntarios(igrejaAtiva.id),
    search: (query) => IgrejaRepository.listarVoluntarios(igrejaAtiva.id, query),
    fetchOne: undefined,    
  });
}
