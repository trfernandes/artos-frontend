import { EscalaItem } from './EscalaItem';
import { Identifiable } from './Indentifiable';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export interface EscalaSubstituicao extends Identifiable {
  escalaItemId: string;
  escalaItem?: EscalaItem;
  solicitanteId: string;
  solicitante?: MinisterioVoluntario;
  substitutoId: string;
  substituto?: MinisterioVoluntario;
  dataSolicitacao: Date;
  dataResposta?: Date;
  status?: EscalaSubstituicaoStatusEnum;
  motivo: string;
}

export enum EscalaSubstituicaoStatusEnum {
  Pendente = '0',
  Aprovada = '1',
  Recusada = '2',
}
