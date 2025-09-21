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
  endereco: string;
  telefone: string;
  sexo: 'M' | 'F';
  foto: string;
  ministerios?: MinisterioVoluntario[];
  senha: string;
  papel: VoluntarioPapelEnum;
}
