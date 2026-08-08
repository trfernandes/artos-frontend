import apiClient from './api-client';
import { ResponseMinisterioDto } from '../dtos/Ministerio/ministerio.response';
import { DynamicQuery } from '../utils/query_utils';

type ApiEnvelope<T> = {
  data: T;
};

class IgrejaMinisteriosApiClass {
  private resourceName = 'igrejas';

  /**
   * Listar ministerios da igreja com busca avancada (JWT)
   * POST /igrejas/{igrejaId}/ministerios/search
   */
  async listarMinisterios(
    igrejaId: string,
    query?: DynamicQuery,
  ): Promise<ResponseMinisterioDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseMinisterioDto[]>>(
      `/${this.resourceName}/${igrejaId}/ministerios/search`,
      query || {},
    );
    return response.data.data;
  }
}

export const IgrejaMinisteriosApi = new IgrejaMinisteriosApiClass();
