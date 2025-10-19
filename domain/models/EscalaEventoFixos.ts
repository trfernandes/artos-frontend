import { EscalaEvento } from './EscalaEvento';
import { MinisterioFuncao } from './MinisterioFuncao';
import { Voluntario } from './Voluntario';

export interface EscalaEventoFixos {
  escalaEvento?: EscalaEvento;
  escalaEventoId: string;
  voluntario?: Voluntario;
  voluntarioId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
}
