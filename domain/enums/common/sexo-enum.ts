export enum SexoEnum {
  Masculino = 'M',
  Feminino = 'F',
}

export const SexoEnumMap: Record<number, SexoEnum> = {
  '0': SexoEnum.Masculino,
  '1': SexoEnum.Feminino,
};

export const SexoEnumLabel: Record<SexoEnum, string> = {
  [SexoEnum.Masculino]: 'Masculino',
  [SexoEnum.Feminino]: 'Feminino',
};
