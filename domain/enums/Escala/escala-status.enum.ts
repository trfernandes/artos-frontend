export enum EscalaStatusEnum {
  Gerada = '1',
  Publicada = '2',
  Concluida = '3',
}

export const EscalaStatusEnumLabel: Record<EscalaStatusEnum, string> = {
  [EscalaStatusEnum.Gerada]: 'Gerada',
  [EscalaStatusEnum.Publicada]: 'Publicada',
  [EscalaStatusEnum.Concluida]: 'Concluída',
};
