import { EscalaEquipe } from './EscalaEquipe';
import { EscalaEvento } from './EscalaEvento';
import { EscalaTemplate } from './EscalaTemplate';
import { EscalaVoluntario } from './EscalaVoluntario';
import { Evento } from './Evento';
import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';
import { Voluntario } from './Voluntario';

export interface Escala extends Identifiable {
  nome: string;
  dataInicio: Date;
  dataTermino: Date;
  status: string;
  ministerio?: Ministerio;
  ministerioId: string;
  criadoPor?: Voluntario;
  criadoPorId: string;
  template?: EscalaTemplate;
  templateId: string;
  evento?: Evento;
  eventoId: string;
  dataGeracao: Date;
  dataConsolidacao?: Date;
  dataPublicacao?: Date;
  eventos?: EscalaEvento[];
  equipe?: EscalaEquipe[];
  voluntarios?: EscalaVoluntario[];
}
