import { IgrejaCadastroSolicitacaoStatusEnum } from '../../enums/Igreja/cadastro-solicitacao-status.enum';
import { IgrejaStatusEnum } from '../../enums/Igreja/status.enum';

// Dados salvos no storage durante o cadastro de igreja
export type CadastroIgrejaStorageDto = {
  cadastroId: string;
  cadastroSecret: string;
  responsavelEmail: string;
};

// Request do POST /public/cadastro-igreja
export type CreateCadastroIgrejaDto = {
  igrejaNome: string;
  igrejaCidade?: string | null;
  igrejaUf?: string | null;
  igrejaCodigo?: string | null;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelSenha: string;
};

// Response do POST /public/cadastro-igreja
export type CreateCadastroResponseDto = {
  cadastroId: string;
  igrejaId: string;
  status: IgrejaCadastroSolicitacaoStatusEnum;
  nextAction: string;
  cadastroSecret: string;
};

// Response do GET /public/cadastro-igreja/:id/status
export type StatusCadastroResponseDto = {
  cadastroId: string;
  statusSolicitacao: IgrejaCadastroSolicitacaoStatusEnum;
  igrejaStatus: IgrejaStatusEnum;
  emailConfirmado: boolean;
  trialEndsAt?: string | null;
  nextAction: string;
  emailEnviadoEm?: string | null;
  linkExpiraEm?: string | null;
  // Token de acesso retornado quando o cadastro é confirmado
  access_token?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    fotoUrl?: string | null;
    fotoThumbUrl?: string | null;
  };
  igrejas?: Array<{
    id: string;
    nome: string;
    logoUrl?: string | null;
    logoThumbUrl?: string | null;
    role: string;
    ministerios: any[];
  }>;
};

// Request do PATCH /public/cadastro-igreja/:id/alterar-email
export type AlterarEmailCadastroDto = {
  novoEmail: string;
};

// Request do POST /public/cadastro-igreja/:id/confirmar-email
export type ConfirmarEmailCadastroDto = {
  token: string;
};

// Response padrão para ações simples
export type CadastroIgrejaActionResponseDto = {
  ok: boolean;
};
