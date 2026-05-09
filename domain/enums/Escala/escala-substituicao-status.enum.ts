export enum EscalaSubstituicaoStatusEnum {
  Pendente = '0',
  Aprovada = '1',
  Recusada = '2',
  Cancelada = '3',
}

export const EscalaSubstituicaoStatusEnumLabel: Record<EscalaSubstituicaoStatusEnum, string> = {
  [EscalaSubstituicaoStatusEnum.Pendente]: 'Pendente',
  [EscalaSubstituicaoStatusEnum.Aprovada]: 'Aprovada',
  [EscalaSubstituicaoStatusEnum.Recusada]: 'Recusada',
  [EscalaSubstituicaoStatusEnum.Cancelada]: 'Cancelada',
};
