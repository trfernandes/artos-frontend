import { ThemePalette } from '../../../constants/colors';

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

export function getMinisterioStatusColorMap(
  palette: Pick<ThemePalette, 'primary' | 'error'>,
): Record<MinisterioVoluntarioStatusEnum, string> {
  return {
    [MinisterioVoluntarioStatusEnum.Ativo]: palette.primary,
    [MinisterioVoluntarioStatusEnum.Inativo]: palette.error,
  };
}
