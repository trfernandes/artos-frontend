export enum MinisterioTipoEnum {
  Outros = '1',
  Louvor = '2',
}

export const MinisterioTipoLabel: Record<MinisterioTipoEnum, string> = {
  [MinisterioTipoEnum.Outros]: 'Outros',
  [MinisterioTipoEnum.Louvor]: 'Louvor',
};

export const MinisterioTipoEnumMap: Record<number, MinisterioTipoEnum> = {
  1: MinisterioTipoEnum.Outros,
  2: MinisterioTipoEnum.Louvor,
};
