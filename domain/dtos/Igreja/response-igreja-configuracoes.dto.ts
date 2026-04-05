import { ModoEntradaEnum } from '../../enums/modo-entrada.enum';
import { NotificacaoTipoPreferenciaDto } from './update-igreja-notificacoes.dto';

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
  faturamento?: {
    cnpj?: string | null;
    telefoneCobranca?: string | null;
    emailCobranca?: string | null;
    cep?: string | null;
    rua?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    cidadeIbge?: string | null;
    uf?: string | null;
    complemento?: string | null;
    completo?: boolean;
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
      notificacoesHabilitadas?: boolean;
      antecedenciaHoras?: number;
      lembretesHoras?: number[];
      canais?: {
        push?: boolean;
        whatsapp?: boolean;
      };
      canaisPush?: boolean;
      canaisWhatsapp?: boolean;
      preferenciasPorTipo?: Record<string, NotificacaoTipoPreferenciaDto>;
    };
  };
  notificacoes?: {
    habilitadas?: boolean;
    notificacoesHabilitadas?: boolean;
    antecedenciaHoras?: number;
    lembretesHoras?: number[];
    canais?: {
      push?: boolean;
      whatsapp?: boolean;
    };
    canaisPush?: boolean;
    canaisWhatsapp?: boolean;
    preferenciasPorTipo?: Record<string, NotificacaoTipoPreferenciaDto>;
  };
}
