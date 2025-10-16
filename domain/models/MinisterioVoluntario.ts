import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';
import { Voluntario } from './Voluntario';

export interface MinisterioVoluntario extends Identifiable {
  ministerio?: Ministerio;
  ministerioId: string;
  voluntario?: Voluntario;
  voluntarioId: string;
  hierarquia: HierarquiaEnum;
}

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
