import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';
import { MinisterioVoluntarioFuncao } from './MinisterioVoluntarioFuncao';
import { MinisterioVoluntarioFuncaoHistorico } from './MinisterioVoluntarioFuncaoHistorico';
import { MinisterioVoluntarioHistorico } from './MinisterioVoluntarioHistorico copy';
import { Voluntario } from './Voluntario';

export interface MinisterioVoluntario extends Identifiable {
  ministerio?: Ministerio;
  ministerioId: string;
  voluntario?: Voluntario;
  voluntarioId: string;
  hierarquia: HierarquiaEnum;
  funcoes?: MinisterioVoluntarioFuncao[];
  status: MinisterioVoluntarioStatusEnum;
  dataInicio: Date;
  historico?: MinisterioVoluntarioHistorico[];
  historicoFuncoes?: MinisterioVoluntarioFuncaoHistorico[];
}

export enum MinisterioVoluntarioStatusEnum {
  Ativo = '0',
  Inativo = '1',
}

export const MinisterioVoluntarioStatusEnumLabel: Record<MinisterioVoluntarioStatusEnum, string> = {
  [MinisterioVoluntarioStatusEnum.Ativo]: 'Ativo',
  [MinisterioVoluntarioStatusEnum.Inativo]: 'Inativo',
};

export const MinisterioVoluntarioStatusEnumMap: Record<string, MinisterioVoluntarioStatusEnum> = {
  '0': MinisterioVoluntarioStatusEnum.Ativo,
  '1': MinisterioVoluntarioStatusEnum.Inativo,
};

export enum HierarquiaEnum {
  Voluntario = 0,
  Lider = 1,
  Auxiliar = 2,
}

export const HierarquiaEnumLabel: Record<HierarquiaEnum, string> = {
  [HierarquiaEnum.Voluntario]: 'Voluntário',
  [HierarquiaEnum.Lider]: 'Líder',
  [HierarquiaEnum.Auxiliar]: 'Auxiliar',
};

export const HierarquiaEnumMap: Record<number, HierarquiaEnum> = {
  0: HierarquiaEnum.Voluntario,
  1: HierarquiaEnum.Lider,
  2: HierarquiaEnum.Auxiliar,
};
