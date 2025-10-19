import { EscalaEvento } from './EscalaEvento';
import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { MinisterioFuncao } from './MinisterioFuncao';

export interface EscalaEventoFuncoes {
  escalaEvento?: EscalaEvento;
  escalaEventoId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
  quantidade: number;
  experienciaMinima?: EscalaTemplateExperienciaEnum;
}
