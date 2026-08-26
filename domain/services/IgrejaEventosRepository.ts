import { IgrejaEventosApi } from '../api/IgrejaEventosApi';
import DateUtils from '../../utils/date_utils';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import {
  RemoveEventoTemplatePadraoDto,
  UpdateEventoTemplatePadraoDto,
} from '../dtos/Evento/update-evento-template-padrao.dto';
import {
  RemoveEventoEnsaioDto,
  ResponseEventoEnsaioDto,
  UpdateEventoEnsaioDto,
} from '../dtos/Evento/update-evento-ensaio.dto';
import {
  CancelEventoOcorrenciaDto,
  RemoveEventoOcorrenciaDadosDto,
  ResponseEventoOcorrenciaCancelamentoDto,
  ResponseEventoOcorrenciaDadosDto,
  RestoreEventoOcorrenciaDto,
  UpdateEventoOcorrenciaDadosDto,
} from '../dtos/Evento/update-evento-ocorrencia-dados.dto';
import { CreateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.create';
import { ResponseEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.response';
import { UpdateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.update';
import { ReorderEventoSetlistDto } from '../dtos/Evento/reorder-evento-setlist.dto';
import {
  RemoveEventoSetlistResponsavelDto,
  UpdateEventoSetlistResponsavelDto,
} from '../dtos/Evento/update-evento-setlist-responsavel.dto';
import { DynamicQuery } from '../utils/query_utils';
import { ResponseEquipeOcorrenciaDto } from '../dtos/Evento/evento-equipe.response';
import { ResponseEventoSetlistObservacoesDto } from '../dtos/Evento/evento-setlist-observacoes.response';
import { UpsertEventoSetlistObservacoesDto } from '../dtos/Evento/evento-setlist-observacoes.update';
import { ResponseEventoSetlistItemEstruturaDto } from '../dtos/Evento/evento-setlist-item-estrutura.response';
import { UpsertEventoSetlistItemEstruturaDto } from '../dtos/Evento/evento-setlist-item-estrutura.update';
import {
  GetMusicasTocadasRelatorioParams,
  ResponseMusicasTocadasRelatorioDto,
} from '../dtos/Evento/musicas-tocadas-relatorio.dto';
import {
  GetSetlistsResumoParams,
  ResponseSetlistResumoDto,
} from '../dtos/Evento/setlists-resumo.dto';

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
  async buscarPorIntervalo(
    igrejaId: string,
    params: EventosIntervaloParams,
  ): Promise<ResponseEventoOcorrenciaDto[]> {
    const response = await IgrejaEventosApi.buscarPorIntervalo(igrejaId, {
      dataInicio: DateUtils.localDayToUtcDate(new Date(params.dataInicio)).toISOString(),
      dataTermino: DateUtils.localDayEndToUtcDate(new Date(params.dataTermino)).toISOString(),
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

  /**
   * Atualizar dados (data/hora/local) da ocorrência por escopo (JWT)
   */
  atualizarDadosOcorrencia(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoOcorrenciaDadosDto,
  ): Promise<ResponseEventoOcorrenciaDadosDto> {
    return IgrejaEventosApi.atualizarDadosOcorrencia(igrejaId, eventoId, dto);
  }

  /**
   * Remover override de dados da ocorrência por escopo/data (JWT)
   */
  removerDadosOcorrencia(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoOcorrenciaDadosDto,
  ): Promise<ResponseEventoOcorrenciaDadosDto | null> {
    return IgrejaEventosApi.removerDadosOcorrencia(igrejaId, eventoId, params);
  }

  cancelarOcorrencia(
    igrejaId: string,
    eventoId: string,
    dto: CancelEventoOcorrenciaDto,
  ): Promise<ResponseEventoOcorrenciaCancelamentoDto> {
    return IgrejaEventosApi.cancelarOcorrencia(igrejaId, eventoId, dto);
  }

  restaurarOcorrencia(
    igrejaId: string,
    eventoId: string,
    params: RestoreEventoOcorrenciaDto,
  ): Promise<ResponseEventoOcorrenciaCancelamentoDto> {
    return IgrejaEventosApi.restaurarOcorrencia(igrejaId, eventoId, params);
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

  listarSetlist(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEventoSetlistItemDto[]> {
    return IgrejaEventosApi.listarSetlist(igrejaId, eventoId, ministerioId, dataOcorrencia);
  }

  listarEquipe(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEquipeOcorrenciaDto> {
    return IgrejaEventosApi.listarEquipe(igrejaId, eventoId, ministerioId, dataOcorrencia);
  }

  obterObservacoesSetlist(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEventoSetlistObservacoesDto> {
    return IgrejaEventosApi.obterObservacoesSetlist(
      igrejaId,
      eventoId,
      ministerioId,
      dataOcorrencia,
    );
  }

  salvarObservacoesSetlist(
    igrejaId: string,
    eventoId: string,
    dto: UpsertEventoSetlistObservacoesDto,
  ): Promise<ResponseEventoSetlistObservacoesDto> {
    return IgrejaEventosApi.salvarObservacoesSetlist(igrejaId, eventoId, dto);
  }

  obterEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEventoSetlistItemEstruturaDto> {
    return IgrejaEventosApi.obterEstruturaSetlistItem(
      igrejaId,
      eventoId,
      itemId,
      ministerioId,
      dataOcorrencia,
    );
  }

  substituirEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    dto: UpsertEventoSetlistItemEstruturaDto,
  ): Promise<ResponseEventoSetlistItemEstruturaDto> {
    return IgrejaEventosApi.substituirEstruturaSetlistItem(igrejaId, eventoId, itemId, dto);
  }

  removerEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEventoSetlistItemEstruturaDto> {
    return IgrejaEventosApi.removerEstruturaSetlistItem(
      igrejaId,
      eventoId,
      itemId,
      ministerioId,
      dataOcorrencia,
    );
  }

  criarSetlistItem(
    igrejaId: string,
    eventoId: string,
    dto: CreateEventoSetlistItemDto,
  ): Promise<ResponseEventoSetlistItemDto> {
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

  removerSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<void> {
    return IgrejaEventosApi.removerSetlistItem(
      igrejaId,
      eventoId,
      itemId,
      ministerioId,
      dataOcorrencia,
    );
  }

  reordenarSetlist(
    igrejaId: string,
    eventoId: string,
    dto: ReorderEventoSetlistDto,
  ): Promise<ResponseEventoSetlistItemDto[]> {
    return IgrejaEventosApi.reordenarSetlist(igrejaId, eventoId, dto);
  }

  obterRelatorioMusicasTocadas(
    igrejaId: string,
    params: GetMusicasTocadasRelatorioParams,
  ): Promise<ResponseMusicasTocadasRelatorioDto> {
    return IgrejaEventosApi.obterRelatorioMusicasTocadas(igrejaId, params);
  }

  obterSetlistsResumo(
    igrejaId: string,
    ministerioId: string,
    params?: GetSetlistsResumoParams,
  ): Promise<ResponseSetlistResumoDto[]> {
    return IgrejaEventosApi.obterSetlistsResumo(igrejaId, ministerioId, params);
  }
}

export const IgrejaEventosRepository = new IgrejaEventosRepositoryClass();
