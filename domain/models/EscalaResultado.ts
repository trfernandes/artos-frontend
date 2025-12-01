import { Escala } from './Escala';
import { EscalaSubstituicao } from './EscalaSubstituicao';
import { Evento } from './Evento';
import { Identifiable } from './Indentifiable';
import { MinisterioFuncao } from './MinisterioFuncao';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export enum EscalaResultadoStatusEnum {
  Pendente = '0',
  Confirmado = '1',
  Substituido = '2',
  Ausente = '3',
}

export const EscalaResultadoStatusEnumLabel: Record<EscalaResultadoStatusEnum, string> = {
  [EscalaResultadoStatusEnum.Pendente]: 'Pendente',
  [EscalaResultadoStatusEnum.Confirmado]: 'Confirmado',
  [EscalaResultadoStatusEnum.Substituido]: 'Substituído',
  [EscalaResultadoStatusEnum.Ausente]: 'Ausente',
};

export interface EscalaResultado extends Identifiable {
  escala: Escala;
  evento: Evento;
  dataOcorrencia: Date;
  voluntario: MinisterioVoluntario;
  funcao: MinisterioFuncao;
  status: EscalaResultadoStatusEnum;
  substituicao?: EscalaSubstituicao;
}
