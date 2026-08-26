import apiClient from './api-client';
import type { GetEventosIntervaloDto } from '../dtos/Evento/get-eventos-intervalo.dto';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
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
import {
  RemoveEventoSetlistResponsavelDto,
  UpdateEventoSetlistResponsavelDto,
} from '../dtos/Evento/update-evento-setlist-responsavel.dto';
import { ResponseEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.response';
import { CreateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.create';
import { UpdateEventoSetlistItemDto } from '../dtos/Evento/evento-setlist-item.update';
import { ReorderEventoSetlistDto } from '../dtos/Evento/reorder-evento-setlist.dto';
import { DynamicQuery } from '../utils/query_utils';
import { ResponseEventoSetlistItemEstruturaDto } from '../dtos/Evento/evento-setlist-item-estrutura.response';
import { UpsertEventoSetlistItemEstruturaDto } from '../dtos/Evento/evento-setlist-item-estrutura.update';
import { ResponseEventoSetlistObservacoesDto } from '../dtos/Evento/evento-setlist-observacoes.response';
import { UpsertEventoSetlistObservacoesDto } from '../dtos/Evento/evento-setlist-observacoes.update';
import { ResponseEquipeOcorrenciaDto } from '../dtos/Evento/evento-equipe.response';
import {
  GetMusicasTocadasRelatorioParams,
  ResponseMusicasTocadasRelatorioDto,
} from '../dtos/Evento/musicas-tocadas-relatorio.dto';
import {
  GetSetlistsResumoParams,
  ResponseSetlistResumoDto,
} from '../dtos/Evento/setlists-resumo.dto';

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
  async buscarPorIntervalo(
    igrejaId: string,
    params: GetEventosIntervaloDto,
  ): Promise<ResponseEventoOcorrenciaDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseEventoOcorrenciaDto[]>>(
      `/${this.resourceName}/${igrejaId}/eventos/intervalo`,
      {
        params,
      },
    );
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

  /**
   * Atualizar ensaio por escopo (JWT)
   * PATCH /igrejas/{igrejaId}/eventos/{eventoId}/ensaio
   */
  async atualizarEnsaio(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoEnsaioDto,
  ): Promise<ResponseEventoEnsaioDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoEnsaioDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ensaio`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Remover ensaio por escopo/data (JWT)
   * DELETE /igrejas/{igrejaId}/eventos/{eventoId}/ensaio?escopo=...&dataOcorrencia=...
   */
  async removerEnsaio(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoEnsaioDto,
  ): Promise<ResponseEventoEnsaioDto | null> {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoEnsaioDto | null>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ensaio`,
      { params },
    );
    return response.data?.data ?? null;
  }

  /**
   * Atualizar dados (data/hora/local) da ocorrência por escopo (JWT)
   * PATCH /igrejas/{igrejaId}/eventos/{eventoId}/ocorrencia-dados
   */
  async atualizarDadosOcorrencia(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoOcorrenciaDadosDto,
  ): Promise<ResponseEventoOcorrenciaDadosDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoOcorrenciaDadosDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ocorrencia-dados`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Remover override de dados da ocorrência por escopo/data (JWT)
   * DELETE /igrejas/{igrejaId}/eventos/{eventoId}/ocorrencia-dados?escopo=...&dataReferencia=...
   */
  async removerDadosOcorrencia(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoOcorrenciaDadosDto,
  ): Promise<ResponseEventoOcorrenciaDadosDto | null> {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoOcorrenciaDadosDto | null>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ocorrencia-dados`,
      { params },
    );
    return response.data?.data ?? null;
  }

  async cancelarOcorrencia(
    igrejaId: string,
    eventoId: string,
    dto: CancelEventoOcorrenciaDto,
  ): Promise<ResponseEventoOcorrenciaCancelamentoDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoOcorrenciaCancelamentoDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ocorrencia-cancelamento`,
      dto,
    );
    return response.data.data;
  }

  async restaurarOcorrencia(
    igrejaId: string,
    eventoId: string,
    params: RestoreEventoOcorrenciaDto,
  ): Promise<ResponseEventoOcorrenciaCancelamentoDto> {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoOcorrenciaCancelamentoDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/ocorrencia-cancelamento`,
      { params },
    );
    return response.data.data;
  }

  async atualizarResponsavelSetlist(
    igrejaId: string,
    eventoId: string,
    dto: UpdateEventoSetlistResponsavelDto,
  ): Promise<ResponseEventoOcorrenciaDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoOcorrenciaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist-responsavel`,
      dto,
    );
    return response.data.data;
  }

  async removerResponsavelSetlist(
    igrejaId: string,
    eventoId: string,
    params: RemoveEventoSetlistResponsavelDto,
  ): Promise<ResponseEventoOcorrenciaDto | null> {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoOcorrenciaDto | null>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist-responsavel`,
      { params },
    );
    return response.data?.data ?? null;
  }

  async listarSetlist(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<ResponseEventoSetlistItemDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseEventoSetlistItemDto[]>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist`,
      { params: { ministerioId, dataOcorrencia } },
    );
    return response.data.data;
  }

  async listarEquipe(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ) {
    const response = await apiClient.get<ApiEnvelope<ResponseEquipeOcorrenciaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/equipe`,
      { params: { ministerioId, dataOcorrencia } },
    );
    return response.data.data;
  }

  async obterObservacoesSetlist(
    igrejaId: string,
    eventoId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ) {
    const response = await apiClient.get<ApiEnvelope<ResponseEventoSetlistObservacoesDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/observacoes`,
      { params: { ministerioId, dataOcorrencia } },
    );
    return response.data.data;
  }

  async salvarObservacoesSetlist(
    igrejaId: string,
    eventoId: string,
    dto: UpsertEventoSetlistObservacoesDto,
  ) {
    const response = await apiClient.put<ApiEnvelope<ResponseEventoSetlistObservacoesDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/observacoes`,
      dto,
    );
    return response.data.data;
  }

  async obterEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ) {
    const response = await apiClient.get<ApiEnvelope<ResponseEventoSetlistItemEstruturaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/${itemId}/estrutura`,
      { params: { ministerioId, dataOcorrencia } },
    );
    return response.data.data;
  }

  async substituirEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    dto: UpsertEventoSetlistItemEstruturaDto,
  ) {
    const response = await apiClient.put<ApiEnvelope<ResponseEventoSetlistItemEstruturaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/${itemId}/estrutura`,
      dto,
    );
    return response.data.data;
  }

  async removerEstruturaSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ) {
    const response = await apiClient.delete<ApiEnvelope<ResponseEventoSetlistItemEstruturaDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/${itemId}/estrutura`,
      { params: { ministerioId, dataOcorrencia } },
    );
    return response.data.data;
  }

  async criarSetlistItem(
    igrejaId: string,
    eventoId: string,
    dto: CreateEventoSetlistItemDto,
  ): Promise<ResponseEventoSetlistItemDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseEventoSetlistItemDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist`,
      dto,
    );
    return response.data.data;
  }

  async atualizarSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    dto: UpdateEventoSetlistItemDto,
  ): Promise<ResponseEventoSetlistItemDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoSetlistItemDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/${itemId}`,
      dto,
    );
    return response.data.data;
  }

  async removerSetlistItem(
    igrejaId: string,
    eventoId: string,
    itemId: string,
    ministerioId: string,
    dataOcorrencia: string,
  ): Promise<void> {
    await apiClient.delete(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist/${itemId}`,
      {
        params: { ministerioId, dataOcorrencia },
      },
    );
  }

  async reordenarSetlist(
    igrejaId: string,
    eventoId: string,
    dto: ReorderEventoSetlistDto,
  ): Promise<ResponseEventoSetlistItemDto[]> {
    const response = await apiClient.patch<ApiEnvelope<ResponseEventoSetlistItemDto[]>>(
      `/${this.resourceName}/${igrejaId}/eventos/${eventoId}/setlist-reorder`,
      dto,
    );
    return response.data.data;
  }

  async obterRelatorioMusicasTocadas(
    igrejaId: string,
    params: GetMusicasTocadasRelatorioParams,
  ): Promise<ResponseMusicasTocadasRelatorioDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseMusicasTocadasRelatorioDto>>(
      `/${this.resourceName}/${igrejaId}/eventos/musicas-tocadas-relatorio`,
      params,
    );
    return response.data.data;
  }

  async obterSetlistsResumo(
    igrejaId: string,
    ministerioId: string,
    params?: GetSetlistsResumoParams,
  ): Promise<ResponseSetlistResumoDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseSetlistResumoDto[]>>(
      `/${this.resourceName}/${igrejaId}/ministerios/${ministerioId}/setlists-resumo`,
      { params },
    );
    return response.data.data;
  }
}

export const IgrejaEventosApi = new IgrejaEventosApiClass();
