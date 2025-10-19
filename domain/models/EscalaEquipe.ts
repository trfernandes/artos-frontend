import { Escala } from './Escala';
import { Identifiable } from './Indentifiable';
import { MinisterioFuncao } from './MinisterioFuncao';
import { Voluntario } from './Voluntario';

export interface EscalaEquipe extends Identifiable {
  escala?: Escala;
  escalaId: string;
  voluntario?: Voluntario;
  voluntarioId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
}
