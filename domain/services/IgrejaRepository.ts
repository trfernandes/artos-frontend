import { IgrejaApi } from '../api/IgrejaApi';
import { BaseRepository } from './BaseRepository';
import { CreateIgrejaDto } from '../dtos/Igreja/create-igreja.dto';
import { CreateIgrejaPublicoDto } from '../dtos/Igreja/create-igreja-publico.dto';
import { ResponseIgrejaDto } from '../dtos/Igreja/response-igreja.dto';
import { UpdateIgrejaDto } from '../dtos/Igreja/update-igreja.dto';
import { VerificarCodigoIgrejaResponseDto } from '../dtos/Igreja/verificar-codigo-igreja.dto';
import { JoinByCodigoDto } from '../dtos/Igreja/join-by-codigo.dto';
import { AprovarMembroDto } from '../dtos/Igreja/aprovar-membro.dto';
import { UpdateVoluntarioRoleDto } from '../dtos/Igreja/update-voluntario-role.dto';
import { ResponseIgrejaAssinaturaDto } from '../dtos/Igreja/response-igreja-assinatura.dto';
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
import { ResponseVoluntarioIgrejaDto } from '../dtos/Voluntario/response-voluntario-igreja.dto';
import { DynamicQuery } from '../utils/query_utils';
import { ResponseIgrejaVoluntarioDto } from '../dtos/Igreja/response-igreja-voluntario.dto';

class IgrejaRepositoryClass extends BaseRepository<
  ResponseIgrejaDto,
  CreateIgrejaDto,
  UpdateIgrejaDto
> {
  constructor() {
    super(IgrejaApi);
  }

  // ========== IGREJAS ==========

  /**
   * Cria uma nova igreja e associa o usuário como administrador (JWT)
   */
  criarIgreja(dto: CreateIgrejaDto): Promise<ResponseIgrejaDto> {
    return IgrejaApi.criarIgreja(dto);
  }

  /**
   * Retorna as igrejas onde o usuário é membro ativo (JWT)
   */
  getMinhasIgrejas(): Promise<ResponseIgrejaDto[]> {
    return IgrejaApi.getMinhasIgrejas();
  }

  /**
   * Verifica se um código de igreja está disponível (JWT)
   */
  verificarCodigoDisponivel(codigo: string): Promise<VerificarCodigoIgrejaResponseDto> {
    return IgrejaApi.verificarCodigoDisponivel(codigo);
  }

  /**
   * Verifica se um código de igreja está disponível (Público)
   */
  verificarCodigoDisponivelPublico(codigo: string): Promise<VerificarCodigoIgrejaResponseDto> {
    return IgrejaApi.verificarCodigoDisponivelPublico(codigo);
  }

  /**
   * Cria uma nova igreja com usuário responsável (Público)
   * @deprecated Use CadastroIgrejaRepository para o novo fluxo de cadastro
   */
  criarIgrejaPublico(dto: CreateIgrejaPublicoDto): Promise<ResponseIgrejaDto> {
    return IgrejaApi.criarIgrejaPublico(dto);
  }

  // ========== VOLUNTÁRIOS ==========

  /**
   * Entrar em uma igreja pelo código (JWT)
   */
  entrarPorCodigo(dto: JoinByCodigoDto): Promise<ResponseIgrejaVoluntarioDto> {
    return IgrejaApi.entrarPorCodigo(dto);
  }

  /**
   * Listar solicitações de entrada na igreja (JWT)
   */
  listarSolicitacoes(
    igrejaId: string,
    status?: SolicitacaoStatusEnum,
  ): Promise<ResponseIgrejaSolicitacaoDto[]> {
    return IgrejaApi.listarSolicitacoes(igrejaId, status);
  }

  /**
   * Aprovar solicitação de entrada (JWT)
   */
  aprovarSolicitacao(
    igrejaId: string,
    solicitacaoId: string,
    dto?: AprovarMembroDto,
  ): Promise<ResponseIgrejaSolicitacaoDto> {
    return IgrejaApi.aprovarSolicitacao(igrejaId, solicitacaoId, dto);
  }

  /**
   * Negar solicitação de entrada (JWT)
   */
  negarSolicitacao(
    igrejaId: string,
    solicitacaoId: string,
    dto?: NegarSolicitacaoDto,
  ): Promise<ResponseIgrejaSolicitacaoDto> {
    return IgrejaApi.negarSolicitacao(igrejaId, solicitacaoId, dto);
  }

  /**
   * Listar voluntários da igreja com busca avançada (JWT)
   */
  listarVoluntarios(
    igrejaId: string,
    query?: DynamicQuery,
  ): Promise<ResponseVoluntarioIgrejaDto[]> {
    return IgrejaApi.listarVoluntarios(igrejaId, query);
  }

  /**
   * Remover voluntário da igreja (JWT)
   */
  removerVoluntario(igrejaId: string, voluntarioId: string): Promise<void> {
    return IgrejaApi.removerVoluntario(igrejaId, voluntarioId);
  }

  /**
   * Alterar a função (role) de um voluntário da igreja (JWT, ADMIN)
   */
  alterarRoleVoluntario(
    igrejaId: string,
    voluntarioId: string,
    dto: UpdateVoluntarioRoleDto,
  ): Promise<ResponseIgrejaVoluntarioDto> {
    return IgrejaApi.alterarRoleVoluntario(igrejaId, voluntarioId, dto);
  }

  // ========== CONVITES (ADMIN) ==========

  /**
   * Criar convite para igreja (JWT)
   */
  criarConvite(igrejaId: string, dto?: CreateIgrejaConviteDto): Promise<ResponseIgrejaConviteDto> {
    return IgrejaApi.criarConvite(igrejaId, dto);
  }

  /**
   * Listar convites da igreja (JWT)
   */
  listarConvites(igrejaId: string, status?: string): Promise<ResponseIgrejaConviteDto[]> {
    return IgrejaApi.listarConvites(igrejaId, status);
  }

  /**
   * Revogar convite (JWT)
   */
  revogarConvite(conviteId: string): Promise<ResponseIgrejaConviteDto> {
    return IgrejaApi.revogarConvite(conviteId);
  }

  /**
   * Obter preview de convite (Público)
   */
  getConvitePreview(token: string): Promise<ResponseConvitePreviewDto> {
    return IgrejaApi.getConvitePreview(token);
  }

  /**
   * Aceitar convite (JWT)
   */
  aceitarConvite(token: string): Promise<ResponseAceitarConviteDto> {
    return IgrejaApi.aceitarConvite(token);
  }

  // ========== SOLICITAÇÕES DO USUÁRIO ==========

  /**
   * Listar solicitações de entrada em igrejas do usuário (JWT)
   */
  listarMinhasSolicitacoes(): Promise<ResponseIgrejaSolicitacaoDto[]> {
    return IgrejaApi.listarMinhasSolicitacoes();
  }

  /**
   * Cancelar solicitação de entrada do usuário (JWT)
   */
  cancelarMinhaSolicitacao(solicitacaoId: string): Promise<ResponseIgrejaSolicitacaoDto> {
    return IgrejaApi.cancelarMinhaSolicitacao(solicitacaoId);
  }

  // ========== ASSINATURAS ==========

  /**
   * Obter assinatura da igreja (JWT)
   */
  getAssinatura(igrejaId: string): Promise<ResponseIgrejaAssinaturaDto> {
    return IgrejaApi.getAssinatura(igrejaId);
  }

  /**
   * Solicitar link assinado do portal web de assinatura (JWT)
   */
  solicitarPortalAssinatura(igrejaId: string): Promise<{ url: string }> {
    return IgrejaApi.solicitarPortalAssinatura(igrejaId);
  }

  // ========== CONFIGURAÇÕES ==========

  /**
   * Obter configurações completas da igreja (JWT)
   */
  getConfiguracoes(igrejaId: string): Promise<ResponseIgrejaConfiguracoesDto> {
    return IgrejaApi.getConfiguracoes(igrejaId);
  }

  /**
   * Atualizar dados cadastrais da igreja (JWT)
   */
  updateDados(
    igrejaId: string,
    dto: UpdateIgrejaDadosDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    return IgrejaApi.updateDados(igrejaId, dto);
  }

  /**
   * Atualizar modo de entrada da igreja (JWT)
   */
  updateModoEntrada(
    igrejaId: string,
    dto: UpdateIgrejaModoEntradaDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    return IgrejaApi.updateModoEntrada(igrejaId, dto);
  }

  /**
   * Atualizar configurações de notificações (JWT)
   */
  updateNotificacoes(
    igrejaId: string,
    dto: UpdateIgrejaNotificacoesDto,
  ): Promise<ResponseIgrejaConfiguracoesDto> {
    return IgrejaApi.updateNotificacoes(igrejaId, dto);
  }
}

export const IgrejaRepository = new IgrejaRepositoryClass();
