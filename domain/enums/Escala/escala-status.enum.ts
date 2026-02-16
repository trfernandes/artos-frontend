export enum EscalaStatusEnum {
  Gerada = '1',
  Publicada = '2',
}

export const EscalaStatusEnumLabel: Record<EscalaStatusEnum, string> = {
  [EscalaStatusEnum.Gerada]: 'Gerada',
  [EscalaStatusEnum.Publicada]: 'Publicada',
};
