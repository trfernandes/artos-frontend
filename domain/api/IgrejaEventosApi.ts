import apiClient from './api-client';
import type { GetEventosIntervaloDto } from '../dtos/Evento/get-eventos-intervalo.dto';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { RemoveEventoTemplatePadraoDto, UpdateEventoTemplatePadraoDto } from '../dtos/Evento/update-evento-template-padrao.dto';
import { DynamicQuery } from '../utils/query_utils';

type ApiEnvelope<T> = {
  data: T;
};

class IgrejaEventosApiClass {
  private resourceName = 'igrejas';

  /**
   * Listar eventos da igreja com busca avancada (JWT)
   * POST /igrejas/{igrejaId}/eventos/search
   */
  async listarEventos(igrejaId: string, query?: DynamicQuery): Promise<ResponseEventoDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseEventoDto[]>>(
      `/${this.resourceName}/${igrejaId}/eventos/search`,
      query || {},
    );
    return response.data.data;
  }

  /**
   * Buscar eventos por intervalo (JWT)
   * GET /igrejas/{igrejaId}/eventos/intervalo
   */
  async buscarPorIntervalo(igrejaId: string, params: GetEventosIntervaloDto): Promise<ResponseEventoOcorrenciaDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseEventoOcorrenciaDto[]>>(`/${this.resourceName}/${igrejaId}/eventos/intervalo`, {
      params,
    });
    return response.data.data;
  }

  /**
   * Atualizar template padrao por escopo (JWT)
   * PATCH /igrejas/{igrejaId}/eventos/{eventoId}/template-padrao
   */
  async atualizarTemplatePadrao(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoTemplatePadraoDto,
  ): Promise<ResponseEventoOcorrenciaDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoOcorrenciaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/template-padrao`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Remover template padrao por escopo/data (JWT)
   * DELETE /igrejas/{igrejaId}/eventos/{eventoId}/template-padrao?escopo=...&dataOcorrencia=...
   */
  async removerTemplatePadrao(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoTemplatePadraoDto,
  ): Promise<ResponseEventoOcorrenciaDto | null> {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoOcorrenciaDto | null>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/template-padrao`,
      {
        params,
      },
    );
    return response.data?.data ?? null;
  }
}

export const IgrejaEventosApi = new IgrejaEventosApiClass();
