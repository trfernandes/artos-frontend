import { endOfDay, format } from 'date-fns';
import { IgrejaEventosApi } from '../api/IgrejaEventosApi';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { RemoveEventoTemplatePadraoDto, UpdateEventoTemplatePadraoDto } from '../dtos/Evento/update-evento-template-padrao.dto';
import { DynamicQuery } from '../utils/query_utils';

export interface EventosIntervaloParams {
  dataInicio: Date | string;
  dataTermino: Date | string;
  igrejaId?: string;
}

class IgrejaEventosRepositoryClass {
  /**
   * Listar eventos da igreja com busca avancada (JWT)
   */
  listarEventos(igrejaId: string, query?: DynamicQuery): Promise<ResponseEventoDto[]> {
    return IgrejaEventosApi.listarEventos(igrejaId, query);
  }

  /**
   * Buscar eventos por intervalo (JWT)
   */
  async buscarPorIntervalo(igrejaId: string, params: EventosIntervaloParams): Promise<ResponseEventoOcorrenciaDto[]> {
    const response = await IgrejaEventosApi.buscarPorIntervalo(igrejaId, {
      dataInicio: format(params.dataInicio, "yyyy-MM-dd'T'HH:mm:ss"),
      dataTermino: format(endOfDay(params.dataTermino), "yyyy-MM-dd'T'HH:mm:ss"),
    });
    return response;
  }

  /**
   * Atualizar template padrao por escopo (JWT)
   */
  atualizarTemplatePadrao(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoTemplatePadraoDto,
  ): Promise<ResponseEventoOcorrenciaDto> {
    return IgrejaEventosApi.atualizarTemplatePadrao(igrejaId, eventoId, dto);
  }

  /**
   * Remover template padrao por escopo/data (JWT)
   */
  removerTemplatePadrao(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoTemplatePadraoDto,
  ): Promise<ResponseEventoOcorrenciaDto | null> {
    return IgrejaEventosApi.removerTemplatePadrao(igrejaId, eventoId, params);
  }
}

export const IgrejaEventosRepository = new IgrejaEventosRepositoryClass();
