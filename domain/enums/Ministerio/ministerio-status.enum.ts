export enum MinisterioStatusEnum {
  Ativo = '0',
  Inativo = '1',
}

export const MinisterioStatusEnumMap: Record<string, MinisterioStatusEnum> = {
  '0': MinisterioStatusEnum.Ativo,
  '1': MinisterioStatusEnum.Inativo,
};

export const MinisterioStatusLabel: Record<MinisterioStatusEnum, string> = {
  [MinisterioStatusEnum.Ativo]: 'Ativo',
  [MinisterioStatusEnum.Inativo]: 'Inativo',
};
