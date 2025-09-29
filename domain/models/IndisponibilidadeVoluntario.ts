import { Identifiable } from './Indentifiable';
import { Voluntario } from './Voluntario';

export interface IndisponibilidadeVoluntario extends Identifiable {
  data: Date;
  motivo?: string;
  voluntario?: Voluntario;
  voluntarioId: string;
}
