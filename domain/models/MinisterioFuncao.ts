import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';

export interface MinisterioFuncao extends Identifiable {
  ministerio?: Ministerio;
  ministerioId: string;
  nome: string;
  descricao?: string;
  status: MinisterioFuncaoStatusEnum;
}

export enum MinisterioFuncaoStatusEnum {
  Ativo = '0',
  Inativo = '1',
}

export const MinisterioFuncaoStatusEnumMap: Record<number, MinisterioFuncaoStatusEnum> = {
  0: MinisterioFuncaoStatusEnum.Ativo,
  1: MinisterioFuncaoStatusEnum.Inativo,
};

export const MinisterioFuncaoStatusEnumLabel: Record<MinisterioFuncaoStatusEnum, string> = {
  [MinisterioFuncaoStatusEnum.Ativo]: 'Ativo',
  [MinisterioFuncaoStatusEnum.Inativo]: 'Inativo',
};
