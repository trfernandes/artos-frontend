import { Escala } from './Escala';
import { EscalaEventoFixos } from './EscalaEventoFixos';
import { EscalaEventoFuncoes } from './EscalaEventoFuncoes';
import { EscalaEventoResultado } from './EscalaEventoResultado';
import { EscalaTemplate } from './EscalaTemplate';
import { Identifiable } from './Indentifiable';

export interface EscalaEvento extends Identifiable {
  escala?: Escala;
  escalaId: string;
  evento?: string;
  eventoId: string;
  template?: EscalaTemplate;
  templateId: string;
  data: Date;
  horario?: string;
  funcoes?: EscalaEventoFuncoes[];
  fixos?: EscalaEventoFixos[];
  resultado?: EscalaEventoResultado[];
}
