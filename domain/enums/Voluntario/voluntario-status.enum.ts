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
