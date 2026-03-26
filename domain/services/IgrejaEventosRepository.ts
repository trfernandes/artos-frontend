import { endOfDay, format } from 'date-fns';
import { IgrejaEventosApi } from '../api/IgrejaEventosApi';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { RemoveEventoTemplatePadraoDto, UpdateEventoTemplatePadraoDto } from '../dtos/Evento/update-evento-template-padrao.dto';
import { RemoveEventoEnsaioDto, ResponseEventoEnsaioDto, UpdateEventoEnsaioDto } from '../dtos/Evento/update-evento-ensaio.dto';
import { CreateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.create';
import { ResponseEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.response';
import { UpdateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.update';
import { ReorderEventoSetlistDto } from '../dtos/Evento/reorder-evento-setlist.dto';
import { RemoveEventoSetlistResponsavelDto, UpdateEventoSetlistResponsavelDto } from '../dtos/Evento/update-evento-setlist-responsavel.dto';
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

  /**
   * Atualizar ensaio por escopo (JWT)
   */
  atualizarEnsaio(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoEnsaioDto,
  ): Promise<ResponseEventoEnsaioDto> {
    return IgrejaEventosApi.atualizarEnsaio(igrejaId, eventoId, dto);
  }

  /**
   * Remover ensaio por escopo/data (JWT)
   */
  removerEnsaio(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoEnsaioDto,
  ): Promise<ResponseEventoEnsaioDto | null> {
    return IgrejaEventosApi.removerEnsaio(igrejaId, eventoId, params);
  }

  atualizarResponsavelSetlist(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoSetlistResponsavelDto,
  ): Promise<ResponseEventoOcorrenciaDto> {
    return IgrejaEventosApi.atualizarResponsavelSetlist(igrejaId, eventoId, dto);
  }

  removerResponsavelSetlist(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoSetlistResponsavelDto,
  ): Promise<ResponseEventoOcorrenciaDto | null> {
    return IgrejaEventosApi.removerResponsavelSetlist(igrejaId, eventoId, params);
  }

  listarSetlist(igrejaId: string, eventoId: string, dataOcorrencia: string): Promise<ResponseEventoSetlistItemDto[]> {
    return IgrejaEventosApi.listarSetlist(igrejaId, eventoId, dataOcorrencia);
  }

  criarSetlistItem(igrejaId: string, eventoId: string, dto: CreateEventoSetlistItemDto): Promise<ResponseEventoSetlistItemDto> {
    return IgrejaEventosApi.criarSetlistItem(igrejaId, eventoId, dto);
  }

  atualizarSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    dto: UpdateEventoSetlistItemDto,
  ): Promise<ResponseEventoSetlistItemDto> {
    return IgrejaEventosApi.atualizarSetlistItem(igrejaId, eventoId, itemId, dto);
  }

  removerSetlistItem(igrejaId: string, eventoId: string, itemId: string, dataOcorrencia: string): Promise<void> {
    return IgrejaEventosApi.removerSetlistItem(igrejaId, eventoId, itemId, dataOcorrencia);
  }

  reordenarSetlist(igrejaId: string, eventoId: string, dto: ReorderEventoSetlistDto): Promise<ResponseEventoSetlistItemDto[]> {
    return IgrejaEventosApi.reordenarSetlist(igrejaId, eventoId, dto);
  }
}

export const IgrejaEventosRepository = new IgrejaEventosRepositoryClass();
