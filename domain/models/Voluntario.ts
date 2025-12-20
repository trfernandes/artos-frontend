import { Identifiable } from './Indentifiable';
import { IndisponibilidadeVoluntario } from './IndisponibilidadeVoluntario';
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
  status: VoluntarioStatusEnum;
  indisponibilidades?: IndisponibilidadeVoluntario[];
}

export enum VoluntarioStatusEnum {
  Ativo = '0',
  Inativo = '1',
}

export const VoluntarioStatusEnumLabel: Record<VoluntarioStatusEnum, string> = {
  [VoluntarioStatusEnum.Ativo]: 'Ativo',
  [VoluntarioStatusEnum.Inativo]: 'Inativo',
};

export const VoluntarioStatusEnumMap: Record<string, VoluntarioStatusEnum> = {
  '0': VoluntarioStatusEnum.Ativo,
  '1': VoluntarioStatusEnum.Inativo,
};

export const VoluntarioSexoLabel: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
};

export function calculateProfileCompletion(voluntario: Partial<Voluntario>): number {
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
