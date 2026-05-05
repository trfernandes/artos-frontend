export enum MinisterioTipoEnum {
  Padrao = '1',
  Louvor = '2',
}

export const MinisterioTipoLabel: Record<MinisterioTipoEnum, string> = {
  [MinisterioTipoEnum.Padrao]: 'Padrão',
  [MinisterioTipoEnum.Louvor]: 'Louvor',
};

export const MinisterioTipoEnumMap: Record<number, MinisterioTipoEnum> = {
  1: MinisterioTipoEnum.Padrao,
  2: MinisterioTipoEnum.Louvor,
};
