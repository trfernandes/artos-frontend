import { IgrejaMinisteriosApi } from '../api/IgrejaMinisteriosApi';
import { ResponseMinisterioDto } from '../dtos/Ministerio/ministerio.response';
import { DynamicQuery } from '../utils/query_utils';

class IgrejaMinisteriosRepositoryClass {
  /**
   * Listar ministerios da igreja com busca avancada (JWT)
   */
  listarMinisterios(igrejaId: string, query?: DynamicQuery): Promise<ResponseMinisterioDto[]> {
    return IgrejaMinisteriosApi.listarMinisterios(igrejaId, query);
  }
}

export const IgrejaMinisteriosRepository = new IgrejaMinisteriosRepositoryClass();
