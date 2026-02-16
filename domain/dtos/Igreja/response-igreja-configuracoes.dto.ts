import { ModoEntradaEnum } from '../../enums/modo-entrada.enum';

export interface ResponseIgrejaConfiguracoesDto {
  id: string;
  nome: string;
  codigo: string;
  endereco?: {
    cep?: string | null;
    rua?: string | null;
    numero?: string | null;
    complemento?: string | null;
    cidade?: string | null;
    uf?: string | null;
  };
  telefone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
  modoEntrada: ModoEntradaEnum;
  status?: string;
  configuracoes?: {
    notificacoes?: {
      habilitadas?: boolean;
      antecedenciaHoras?: number;
      canais?: {
        push?: boolean;
        whatsapp?: boolean;
      };
    };
  };
  notificacoes?: {
    habilitadas?: boolean;
    antecedenciaHoras?: number;
    canais?: {
      push?: boolean;
      whatsapp?: boolean;
    };
  };
}
