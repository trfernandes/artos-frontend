export enum EscalaItemStatusEnum {
  Pendente = '0',
  Confirmado = '1',
  Ausente = '2',
  Substituido = '3',
  SubstituicaoSolicitada = '4',
}

export const EscalaItemStatusEnumMap: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: 'Pendente',
  [EscalaItemStatusEnum.Confirmado]: 'Confirmado',
  [EscalaItemStatusEnum.Ausente]: 'Ausente',
  [EscalaItemStatusEnum.Substituido]: 'Substituído',
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: 'Substituição solicitada',
};

export const EscalaItemStatusEnumLabel: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: 'Pendente',
  [EscalaItemStatusEnum.Confirmado]: 'Confirmado',
  [EscalaItemStatusEnum.Ausente]: 'Ausente',
  [EscalaItemStatusEnum.Substituido]: 'Substituído',
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: 'Sub. solicitada',
};
