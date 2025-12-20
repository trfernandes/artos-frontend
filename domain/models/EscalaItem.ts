import { Escala } from './Escala';
import { EscalaSubstituicao } from './EscalaSubstituicao';
import { Evento } from './Evento';
import { Identifiable } from './Indentifiable';
import { MinisterioFuncao } from './MinisterioFuncao';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export enum EscalaItemStatusEnum {
  Pendente = '0',
  Confirmado = '1',
  Ausente = '2',
  Substituido = '3',
  SubstituicaoSolicitada = '4',
}

export const EscalaItemStatusEnumLabel: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: 'Pendente',
  [EscalaItemStatusEnum.Confirmado]: 'Confirmado',
  [EscalaItemStatusEnum.Ausente]: 'Ausente',
  [EscalaItemStatusEnum.Substituido]: 'Substituído',
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: 'Subst. Solicitada',
};

export interface EscalaItem extends Identifiable {
  escala: Escala;
  evento: Evento;
  dataOcorrencia: Date;
  voluntario: MinisterioVoluntario;
  funcao: MinisterioFuncao;
  status: EscalaItemStatusEnum;
  substituicao?: EscalaSubstituicao;
}
