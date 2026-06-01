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
