import { BaseApi } from './BaseApi';
import apiClient from './api-client';
import axios from 'axios';
import { CreateIgrejaDto } from '../dtos/Igreja/create-igreja.dto';
import { CreateIgrejaPublicoDto } from '../dtos/Igreja/create-igreja-publico.dto';
import { ResponseIgrejaDto } from '../dtos/Igreja/response-igreja.dto';
import { UpdateIgrejaDto } from '../dtos/Igreja/update-igreja.dto';
import { VerificarCodigoIgrejaResponseDto } from '../dtos/Igreja/verificar-codigo-igreja.dto';
import { JoinByCodigoDto } from '../dtos/Igreja/join-by-codigo.dto';
import { ResponseIgrejaVoluntarioDto } from '../dtos/Igreja/response-igreja-voluntario.dto';
import { AprovarMembroDto } from '../dtos/Igreja/aprovar-membro.dto';
import { ResponseIgrejaAssinaturaDto } from '../dtos/Igreja/response-igreja-assinatura.dto';
import { CriarCheckoutAssinaturaDto } from '../dtos/Igreja/criar-checkout-assinatura.dto';
import { ResponseAssinaturaCheckoutDto } from '../dtos/Igreja/response-assinatura-checkout.dto';
import { ResponseAceitarConviteDto } from '../dtos/Igreja/response-aceitar-convite.dto';
import { ResponseConvitePreviewDto } from '../dtos/Igreja/response-convite-preview.dto';
import { ResponseIgrejaConviteDto } from '../dtos/Igreja/response-igreja-convite.dto';
import { CreateIgrejaConviteDto } from '../dtos/Igreja/create-igreja-convite.dto';
import {
  ResponseIgrejaSolicitacaoDto,
  SolicitacaoStatusEnum,
} from '../dtos/Igreja/response-igreja-solicitacao.dto';
import { NegarSolicitacaoDto } from '../dtos/Igreja/negar-solicitacao.dto';
import { ResponseIgrejaConfiguracoesDto } from '../dtos/Igreja/response-igreja-configuracoes.dto';
import { UpdateIgrejaDadosDto } from '../dtos/Igreja/update-igreja-dados.dto';
import { UpdateIgrejaModoEntradaDto } from '../dtos/Igreja/update-igreja-modo-entrada.dto';
import { UpdateIgrejaNotificacoesDto } from '../dtos/Igreja/update-igreja-notificacoes.dto';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { DynamicQuery } from '../utils/query_utils';

type ApiEnvelope<T> = {
  data: T;
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  // Forca o servidor a responder com corpo, evitando 304 sem payload no cliente.
  'If-None-Match': '"artos-force-fresh"',
};

class IgrejaApiClass extends BaseApi<ResponseIgrejaDto, CreateIgrejaDto, UpdateIgrejaDto> {
  constructor() {
    super('igrejas');
  }

  // ========== IGREJAS ==========

  /**
   * Cria uma nova igreja e associa o usuário como administrador (JWT)
   * POST /igrejas
   */
  async criarIgreja(dto: CreateIgrejaDto): Promise<ResponseIgrejaDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaDto>>(
      `/${this.resourceName}`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Retorna as igrejas onde o usuário é membro ativo (JWT)
   * GET /igrejas/minhas
   */
  async getMinhasIgrejas(): Promise<ResponseIgrejaDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaDto[]>>(
      `/${this.resourceName}/minhas`,
    );
    return response.data.data;
  }

  /**
   * Verifica se um código de igreja está disponível (JWT)
   * GET /igrejas/codigo-disponivel?codigo={codigo}
   */
  async verificarCodigoDisponivel(codigo: string): Promise<VerificarCodigoIgrejaResponseDto> {
    const response = await apiClient.get<ApiEnvelope<VerificarCodigoIgrejaResponseDto>>(
      `/${this.resourceName}/codigo-disponivel`,
      {
        params: { codigo },
        headers: NO_CACHE_HEADERS,
      },
    );
    return response.data.data;
  }

  /**
   * Verifica se um código de igreja está disponível (Público)
   * GET /igrejas/codigo-disponivel?codigo={codigo}
   */
  async verificarCodigoDisponivelPublico(
    codigo: string,
  ): Promise<VerificarCodigoIgrejaResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.get<ApiEnvelope<VerificarCodigoIgrejaResponseDto>>(
      `${baseURL}/${this.resourceName}/codigo-disponivel`,
      {
        params: { codigo },
        headers: NO_CACHE_HEADERS,
      },
    );
    return response.data.data;
  }

  /**
   * Cria uma nova igreja com usuário responsável (Público)
   * POST /igrejas
   * @deprecated Use CadastroIgrejaRepository para o novo fluxo de cadastro
   */
  async criarIgrejaPublico(dto: CreateIgrejaPublicoDto): Promise<ResponseIgrejaDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.post<ApiEnvelope<ResponseIgrejaDto>>(
      `${baseURL}/${this.resourceName}`,
      dto,
    );
    return response.data.data;
  }

  // ========== VOLUNTÁRIOS ==========

  /**
   * Entrar em uma igreja pelo código (JWT)
   * POST /igrejas/entrar-por-codigo
   */
  async entrarPorCodigo(dto: JoinByCodigoDto): Promise<ResponseIgrejaVoluntarioDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaVoluntarioDto>>(
      `/${this.resourceName}/entrar-por-codigo`,
      dto,
    );
    return response.data.data;
  }

  // ========== SOLICITAÇÕES (ADMIN/LIDER) ==========

  /**
   * Listar solicitações de entrada na igreja (JWT)
   * GET /igrejas/{igrejaId}/solicitacoes?status=PENDING|APPROVED|DENIED|CANCELED
   */
  async listarSolicitacoes(
    igrejaId: string,
    status?: SolicitacaoStatusEnum,
  ): Promise<ResponseIgrejaSolicitacaoDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaSolicitacaoDto[]>>(
      `/${this.resourceName}/${igrejaId}/solicitacoes`,
      { params: status ? { status } : undefined },
    );
    return response.data.data;
  }

  /**
   * Aprovar solicitação de entrada (JWT)
   * POST /igrejas/{igrejaId}/solicitacoes/{solicitacaoId}/aprovar
   */
  async aprovarSolicitacao(
    igrejaId: string,
    solicitacaoId: string,
    dto?: AprovarMembroDto,
  ): Promise<ResponseIgrejaSolicitacaoDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaSolicitacaoDto>>(
      `/${this.resourceName}/${igrejaId}/solicitacoes/${solicitacaoId}/aprovar`,
      dto || {},
    );
    return response.data.data;
  }

  /**
   * Negar solicitação de entrada (JWT)
   * POST /igrejas/{igrejaId}/solicitacoes/{solicitacaoId}/negar
   */
  async negarSolicitacao(
    igrejaId: string,
    solicitacaoId: string,
    dto?: NegarSolicitacaoDto,
  ): Promise<ResponseIgrejaSolicitacaoDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaSolicitacaoDto>>(
      `/${this.resourceName}/${igrejaId}/solicitacoes/${solicitacaoId}/negar`,
      dto || {},
    );
    return response.data.data;
  }

  /**
   * Listar voluntários da igreja com busca avançada (JWT)
   * POST /igrejas/{igrejaId}/voluntarios/search
   */
  async listarVoluntarios(
    igrejaId: string,
    query?: DynamicQuery,
  ): Promise<ResponseVoluntarioDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseVoluntarioDto[]>>(
      `/${this.resourceName}/${igrejaId}/voluntarios/search`,
      query || {},
    );
    return response.data.data;
  }

  /**
   * Remover voluntário da igreja (JWT)
   * DELETE /igrejas/{igrejaId}/voluntarios/{voluntarioId}
   */
  async removerVoluntario(igrejaId: string, voluntarioId: string): Promise<void> {
    await apiClient.delete(`/${this.resourceName}/${igrejaId}/voluntarios/${voluntarioId}`);
  }

  // ========== CONVITES ==========

  /**
   * Criar convite para igreja (JWT)
   * POST /igrejas/{igrejaId}/convites
   */
  async criarConvite(
    igrejaId: string,
    dto?: CreateIgrejaConviteDto,
  ): Promise<ResponseIgrejaConviteDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaConviteDto>>(
      `/${this.resourceName}/${igrejaId}/convites`,
      dto || {},
    );
    return response.data.data;
  }

  /**
   * Listar convites da igreja (JWT)
   * GET /igrejas/{igrejaId}/convites?status=TODOS|ATIVOS|EXPIRADOS|REVOGADOS|USADOS
   */
  async listarConvites(igrejaId: string, status?: string): Promise<ResponseIgrejaConviteDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaConviteDto[]>>(
      `/${this.resourceName}/${igrejaId}/convites`,
      { params: status ? { status } : undefined },
    );
    return response.data.data;
  }

  /**
   * Revogar convite (JWT)
   * POST /convites/{conviteId}/revogar
   */
  async revogarConvite(conviteId: string): Promise<ResponseIgrejaConviteDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaConviteDto>>(
      `/convites/${conviteId}/revogar`,
    );
    return response.data.data;
  }

  /**
   * Obter preview de convite (Público)
   * POST /convites/{token}/preview
   */
  async getConvitePreview(token: string): Promise<ResponseConvitePreviewDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseConvitePreviewDto>>(
      `/convites/${token}/preview`,
    );
    return response.data.data;
  }

  /**
   * Aceitar convite (JWT)
   * POST /convites/{token}/accept
   */
  async aceitarConvite(token: string): Promise<ResponseAceitarConviteDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseAceitarConviteDto>>(
      `/convites/${token}/accept`,
    );
    return response.data.data;
  }

  // ========== SOLICITAÇÕES DO USUÁRIO ==========

  /**
   * Listar solicitações de entrada em igrejas do usuário (JWT)
   * GET /me/igrejas/solicitacoes
   */
  async listarMinhasSolicitacoes(): Promise<ResponseIgrejaSolicitacaoDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaSolicitacaoDto[]>>(
      '/me/igrejas/solicitacoes',
    );
    return response.data.data;
  }

  /**
   * Cancelar solicitação de entrada do usuário (JWT)
   * POST /me/igrejas/solicitacoes/{id}/cancelar
   */
  async cancelarMinhaSolicitacao(solicitacaoId: string): Promise<ResponseIgrejaSolicitacaoDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaSolicitacaoDto>>(
      `/me/igrejas/solicitacoes/${solicitacaoId}/cancelar`,
    );
    return response.data.data;
  }

  // ========== ASSINATURAS ==========

  /**
   * Obter assinatura da igreja (JWT)
   * GET /billing/status?churchId={igrejaId}
   */
  async getAssinatura(igrejaId: string): Promise<ResponseIgrejaAssinaturaDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaAssinaturaDto>>(
      `/billing/status`,
      {
        params: { churchId: igrejaId },
      },
    );
    return response.data.data;
  }

  /**
   * Iniciar checkout da assinatura (JWT)
   * POST /billing/checkout
   */
  async criarCheckoutAssinatura(
    dto: CriarCheckoutAssinaturaDto,
  ): Promise<ResponseAssinaturaCheckoutDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseAssinaturaCheckoutDto>>(
      `/billing/checkout`,
      dto,
    );
    return response.data.data;
  }

  async cancelarAssinatura(igrejaId: string): Promise<void> {
    await apiClient.post('/billing/cancel', { churchId: igrejaId });
  }

  async cancelarTrocaDePlano(igrejaId: string): Promise<void> {
    await apiClient.post('/billing/cancel-plan-change', { churchId: igrejaId });
  }

  // ========== CONFIGURAÇÕES ==========

  /**
   * Obter configurações completas da igreja (JWT)
   * GET /igrejas/{igrejaId}/configuracoes
   */
  async getConfiguracoes(igrejaId: string): Promise<ResponseIgrejaConfiguracoesDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaConfiguracoesDto>>(
      `/${this.resourceName}/${igrejaId}/configuracoes`,
    );
    return response.data.data;
  }

  /**
   * Atualizar dados cadastrais da igreja (JWT)
   * PATCH /igrejas/{igrejaId}/dados
   */
  async updateDados(
    igrejaId: string,
    dto: UpdateIgrejaDadosDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseIgrejaConfiguracoesDto>>(
      `/${this.resourceName}/${igrejaId}/dados`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Atualizar modo de entrada da igreja (JWT)
   * PATCH /igrejas/{igrejaId}/modo-entrada
   */
  async updateModoEntrada(
    igrejaId: string,
    dto: UpdateIgrejaModoEntradaDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseIgrejaConfiguracoesDto>>(
      `/${this.resourceName}/${igrejaId}/modo-entrada`,
      dto,
    );
    return response.data.data;
  }

  /**
   * Atualizar configurações de notificações (JWT)
   * PATCH /igrejas/{igrejaId}/notificacoes
   */
  async updateNotificacoes(
    igrejaId: string,
    dto: UpdateIgrejaNotificacoesDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseIgrejaConfiguracoesDto>>(
      `/${this.resourceName}/${igrejaId}/notificacoes`,
      dto,
    );
    return response.data.data;
  }
}

export const IgrejaApi = new IgrejaApiClass();
