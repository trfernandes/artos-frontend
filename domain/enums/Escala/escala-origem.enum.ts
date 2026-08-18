export enum EscalaOrigemEnum {
  Automatica = 'automatica',
  Manual = 'manual',
}

export const EscalaOrigemEnumLabel: Record<EscalaOrigemEnum, string> = {
  [EscalaOrigemEnum.Automatica]: 'Gerada automaticamente',
  [EscalaOrigemEnum.Manual]: 'Criada manualmente',
};
