export enum VoluntarioStatusEnum {
  PENDENTE_EMAIL = 'PENDENTE_EMAIL',
  ATIVO = 'ATIVO',
  DESATIVADO = 'DESATIVADO',
}

export const VoluntarioStatusEnumLabel: Record<VoluntarioStatusEnum, string> = {
  [VoluntarioStatusEnum.ATIVO]: 'Ativo',
  [VoluntarioStatusEnum.DESATIVADO]: 'Inativo',
  [VoluntarioStatusEnum.PENDENTE_EMAIL]: 'Pendente de E-mail',
};

export const VoluntarioStatusEnumMap: Record<string, VoluntarioStatusEnum> = {
  '0': VoluntarioStatusEnum.ATIVO,
  '1': VoluntarioStatusEnum.DESATIVADO,
  '2': VoluntarioStatusEnum.PENDENTE_EMAIL,
};
