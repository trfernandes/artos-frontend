import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { Identifiable } from './Indentifiable';
import { MinisterioFuncao } from './MinisterioFuncao';
import { MinisterioVoluntario } from './MinisterioVoluntario';

export interface MinisterioVoluntarioFuncao extends Identifiable {
  ministerioVoluntario?: MinisterioVoluntario;
  ministerioVoluntarioId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
  status: MinisterioVoluntarioFuncaoStatusEnum;
  experiencia: EscalaTemplateExperienciaEnum;
}

export enum MinisterioVoluntarioFuncaoStatusEnum {
  Ativo = '0',
  Inativo = '1',
}

export const MinisterioVoluntarioFuncaoStatusEnumLabel: Record<
  MinisterioVoluntarioFuncaoStatusEnum,
  string
> = {
  [MinisterioVoluntarioFuncaoStatusEnum.Ativo]: 'Ativo',
  [MinisterioVoluntarioFuncaoStatusEnum.Inativo]: 'Inativo',
};

export const MinisterioVoluntarioFuncaoStatusEnumMap: Record<
  string,
  MinisterioVoluntarioFuncaoStatusEnum
> = {
  '0': MinisterioVoluntarioFuncaoStatusEnum.Ativo,
  '1': MinisterioVoluntarioFuncaoStatusEnum.Inativo,
};
