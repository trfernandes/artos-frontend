import { Identifiable } from './Indentifiable';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export enum VoluntarioPapelEnum {
  Admin = 0,
  Usuario = 1,
}

export interface Voluntario extends Identifiable {
  nome: string;
  email: string;
  dataNascimento: Date;
  endereco?: string;
  telefone?: string;
  sexo: 'M' | 'F';
  foto: string;
  ministerios?: MinisterioVoluntario[];
  senha: string;
  papel: VoluntarioPapelEnum;
  uploadFoto: string | null;
}

export function calculateProfileCompletion(voluntario: Voluntario): number {
  const requiredFields: (keyof Voluntario)[] = ['nome', 'telefone', 'foto', 'endereco', 'dataNascimento', 'sexo'];

  const filledCount = requiredFields.reduce((count, field) => {
    const value = voluntario[field];
    if (value && value.toString().trim() !== '') {
      return count + 1;
    }
    return count;
  }, 0);

  return Math.round((filledCount / requiredFields.length) * 100);
}
