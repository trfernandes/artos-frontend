import { Identifiable } from './Indentifiable';

export interface Notificacao extends Identifiable {
  voluntario?: string;
  voluntarioId: string;
  tipo: NotificacaoTipoEnum;
  titulo: string;
  mensagem?: string;
  data?: Record<string, any> | null;
  lidaEm?: Date | null;
  criadaEm: Date;
}

export enum NotificacaoTipoEnum {
  EscalaLembrete = 'ESCALA_LEMBRETE',
  TesteLocal = 'TESTE_LOCAL',
}
