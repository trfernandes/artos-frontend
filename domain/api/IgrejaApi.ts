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
import { CreateIgrejaConviteDto } from '../dtos/Igreja/create-igreja-convite.dto';
import { ResponseIgrejaConviteDto } from '../dtos/Igreja/response-igreja-convite.dto';
import { ResponseConvitePreviewDto } from '../dtos/Igreja/response-convite-preview.dto';
import { ResponseIgrejaAssinaturaDto } from '../dtos/Igreja/response-igreja-assinatura.dto';
import { AlterarPlanoDto } from '../dtos/Igreja/alterar-plano.dto';

type ApiEnvelope<T> = {
  data: T;
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
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaDto>>(`/${this.resourceName}`, dto);
    return response.data.data;
  }

  /**
   * Retorna as igrejas onde o usuário é membro ativo (JWT)
   * GET /igrejas/minhas
   */
  async getMinhasIgrejas(): Promise<ResponseIgrejaDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaDto[]>>(`/${this.resourceName}/minhas`);
    return response.data.data;
  }

  /**
   * Verifica se um código de igreja está disponível (JWT)
   * GET /igrejas/codigo-disponivel?codigo={codigo}
   */
  async verificarCodigoDisponivel(codigo: string): Promise<VerificarCodigoIgrejaResponseDto> {
    const response = await apiClient.get<ApiEnvelope<VerificarCodigoIgrejaResponseDto>>(
      `/${this.resourceName}/codigo-disponivel`,
      { params: { codigo } },
    );
    return response.data.data;
  }

  /**
   * Verifica se um código de igreja está disponível (Público)
   * GET /igrejas/codigo-disponivel?codigo={codigo}
   */
  async verificarCodigoDisponivelPublico(codigo: string): Promise<VerificarCodigoIgrejaResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.get<ApiEnvelope<VerificarCodigoIgrejaResponseDto>>(
      `${baseURL}/${this.resourceName}/codigo-disponivel`,
      { params: { codigo } },
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
    const response = await axios.post<ApiEnvelope<ResponseIgrejaDto>>(`${baseURL}/${this.resourceName}`, dto);
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

  /**
   * Listar membros pendentes de aprovação (JWT)
   * GET /igrejas/{igrejaId}/pendentes
   */
  async listarPendentes(igrejaId: string): Promise<ResponseIgrejaVoluntarioDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaVoluntarioDto[]>>(
      `/${this.resourceName}/${igrejaId}/pendentes`,
    );
    return response.data.data;
  }

  /**
   * Aprovar membro pendente (JWT)
   * PATCH /igrejas/{igrejaId}/pendentes/{membroId}/aprovar
   */
  async aprovarMembro(igrejaId: string, membroId: string, dto?: AprovarMembroDto): Promise<ResponseIgrejaVoluntarioDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseIgrejaVoluntarioDto>>(
      `/${this.resourceName}/${igrejaId}/pendentes/${membroId}/aprovar`,
      dto || {},
    );
    return response.data.data;
  }

  /**
   * Rejeitar membro pendente (JWT)
   * DELETE /igrejas/{igrejaId}/pendentes/{membroId}/rejeitar
   */
  async rejeitarMembro(igrejaId: string, membroId: string): Promise<{ ok: true }> {
    const response = await apiClient.delete<ApiEnvelope<{ ok: true }>>(
      `/${this.resourceName}/${igrejaId}/pendentes/${membroId}/rejeitar`,
    );
    return response.data.data;
  }

  // ========== CONVITES ==========

  /**
   * Criar convite para igreja (JWT)
   * POST /igrejas/{igrejaId}/convites
   */
  async criarConvite(igrejaId: string, dto?: CreateIgrejaConviteDto): Promise<ResponseIgrejaConviteDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaConviteDto>>(
      `/${this.resourceName}/${igrejaId}/convites`,
      dto || {},
    );
    return response.data.data;
  }

  /**
   * Obter preview de convite (Público)
   * GET /igrejas/convites/{token}
   */
  async getConvitePreview(token: string): Promise<ResponseConvitePreviewDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.get<ApiEnvelope<ResponseConvitePreviewDto>>(
      `${baseURL}/${this.resourceName}/convites/${token}`,
    );
    return response.data.data;
  }

  /**
   * Aceitar convite (JWT)
   * POST /igrejas/convites/{token}/aceitar
   */
  async aceitarConvite(token: string): Promise<ResponseIgrejaVoluntarioDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseIgrejaVoluntarioDto>>(
      `/${this.resourceName}/convites/${token}/aceitar`,
    );
    return response.data.data;
  }

  // ========== ASSINATURAS ==========

  /**
   * Obter assinatura da igreja (JWT)
   * GET /igrejas/{igrejaId}/assinatura
   */
  async getAssinatura(igrejaId: string): Promise<ResponseIgrejaAssinaturaDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseIgrejaAssinaturaDto>>(
      `/${this.resourceName}/${igrejaId}/assinatura`,
    );
    return response.data.data;
  }

  /**
   * Alterar plano da assinatura (JWT)
   * PATCH /igrejas/{igrejaId}/assinatura/plano
   */
  async alterarPlano(igrejaId: string, dto: AlterarPlanoDto): Promise<ResponseIgrejaAssinaturaDto> {
    const response = await apiClient.patch<ApiEnvelope<ResponseIgrejaAssinaturaDto>>(
      `/${this.resourceName}/${igrejaId}/assinatura/plano`,
      dto,
    );
    return response.data.data;
  }
}

export const IgrejaApi = new IgrejaApiClass();
