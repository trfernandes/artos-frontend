import { EscalaResultado } from './EscalaResultado';
import { Identifiable } from './Indentifiable';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export interface EscalaSubstituicao extends Identifiable {
  escalaResultadoId: string;
  escalaResultado?: EscalaResultado;
  fromVoluntarioId: string;
  fromVoluntario?: MinisterioVoluntario;
  toVoluntarioId: string;
  toVoluntario?: MinisterioVoluntario;
  dataSolicitacao: Date;
  dataConfirmacao?: Date;
  status?: EscalaSubstituicaoStatusEnum;
  motivo: string;
}

export enum EscalaSubstituicaoStatusEnum {
  Pendente = '0',
  Aprovada = '1',
  Recusada = '2',
}
