import { IgrejaApi } from '../api/IgrejaApi';
import { BaseRepository } from './BaseRepository';
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

class IgrejaRepositoryClass extends BaseRepository<ResponseIgrejaDto, CreateIgrejaDto, UpdateIgrejaDto> {
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
   * Listar membros pendentes de aprovação (JWT)
   */
  listarPendentes(igrejaId: string): Promise<ResponseIgrejaVoluntarioDto[]> {
    return IgrejaApi.listarPendentes(igrejaId);
  }

  /**
   * Aprovar membro pendente (JWT)
   */
  aprovarMembro(igrejaId: string, membroId: string, dto?: AprovarMembroDto): Promise<ResponseIgrejaVoluntarioDto> {
    return IgrejaApi.aprovarMembro(igrejaId, membroId, dto);
  }

  /**
   * Rejeitar membro pendente (JWT)
   */
  rejeitarMembro(igrejaId: string, membroId: string): Promise<{ ok: true }> {
    return IgrejaApi.rejeitarMembro(igrejaId, membroId);
  }

  // ========== CONVITES ==========

  /**
   * Criar convite para igreja (JWT)
   */
  criarConvite(igrejaId: string, dto?: CreateIgrejaConviteDto): Promise<ResponseIgrejaConviteDto> {
    return IgrejaApi.criarConvite(igrejaId, dto);
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
  aceitarConvite(token: string): Promise<ResponseIgrejaVoluntarioDto> {
    return IgrejaApi.aceitarConvite(token);
  }

  // ========== ASSINATURAS ==========

  /**
   * Obter assinatura da igreja (JWT)
   */
  getAssinatura(igrejaId: string): Promise<ResponseIgrejaAssinaturaDto> {
    return IgrejaApi.getAssinatura(igrejaId);
  }

  /**
   * Alterar plano da assinatura (JWT)
   */
  alterarPlano(igrejaId: string, dto: AlterarPlanoDto): Promise<ResponseIgrejaAssinaturaDto> {
    return IgrejaApi.alterarPlano(igrejaId, dto);
  }
}

export const IgrejaRepository = new IgrejaRepositoryClass();
