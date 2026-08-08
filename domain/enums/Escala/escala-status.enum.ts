export enum EscalaStatusEnum {
  Gerando = '0',
  Gerada = '1',
  Publicada = '2',
  Cancelada = '3',
  Erro = '4',
}

export const EscalaStatusEnumLabel: Record<EscalaStatusEnum, string> = {
  [EscalaStatusEnum.Gerando]: 'Gerando...',
  [EscalaStatusEnum.Gerada]: 'Gerada',
  [EscalaStatusEnum.Publicada]: 'Publicada',
  [EscalaStatusEnum.Cancelada]: 'Cancelada',
  [EscalaStatusEnum.Erro]: 'Erro',
};
