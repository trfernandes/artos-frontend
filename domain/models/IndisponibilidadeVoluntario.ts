import { Identifiable } from './Indentifiable';
import { Voluntario } from './Voluntario';

export interface IndisponibilidadeVoluntario extends Identifiable {
  data: Date;
  motivo?: string;
  voluntario?: Partial<Voluntario>;
  voluntarioId: string;
}

export interface UpsertIndisponibilidadeVoluntarioItem {
  id?: string;
  data: string;
  motivo?: string | null;
}

export interface UpsertIndisponibilidadesVoluntarioPayload {
  voluntarioId: string;
  indisponibilidades: UpsertIndisponibilidadeVoluntarioItem[];
}
