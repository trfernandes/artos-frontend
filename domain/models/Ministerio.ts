import { Identifiable } from './Indentifiable';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export interface Ministerio extends Identifiable {
  nome: string;
  descricao?: string;
  logo?: string;
  tipo: MinisterioTipoEnum;
  status: MinisterioStatusEnum;
  voluntarios?: MinisterioVoluntario[];
  uploadLogo: string | null;
}

export enum MinisterioStatusEnum {
  Ativo = 1,
  Inativo = 2,
}

export const MinisterioStatusEnumMap: Record<number, MinisterioStatusEnum> = {
  1: MinisterioStatusEnum.Ativo,
  2: MinisterioStatusEnum.Inativo,
};

export const MinisterioStatusLabel: Record<MinisterioStatusEnum, string> = {
  [MinisterioStatusEnum.Ativo]: 'Ativo',
  [MinisterioStatusEnum.Inativo]: 'Inativo',
};

export enum MinisterioTipoEnum {
  Outros = '1',
  Louvor = '2',
}

export const MinisterioTipoLabel: Record<MinisterioTipoEnum, string> = {
  [MinisterioTipoEnum.Outros]: 'Outros',
  [MinisterioTipoEnum.Louvor]: 'Louvor',
};

export const MinisterioTipoEnumMap: Record<number, MinisterioTipoEnum> = {
  1: MinisterioTipoEnum.Outros,
  2: MinisterioTipoEnum.Louvor,
};
