import { EscalaEvento } from './EscalaEvento';
import { MinisterioFuncao } from './MinisterioFuncao';
import { Voluntario } from './Voluntario';

export interface EscalaEventoResultado {
  escalaEvento?: EscalaEvento;
  voluntario?: Voluntario;
  voluntarioId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
  status: EscalaVoluntarioStatusEnum;
  substituto?: Voluntario;
  dataConfirmacao?: Date;
}

export enum EscalaVoluntarioStatusEnum {
  Pendente = '0',
  Confirmado = '1',
  Substituido = '2',
  Ausente = '3',
}
