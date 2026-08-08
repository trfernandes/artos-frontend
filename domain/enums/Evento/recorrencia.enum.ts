export enum RecorrenciaEnum {
  Nunca = 'NUNCA',
  Semanal = 'SEMANAL',
  Mensal = 'MENSAL',
}

export const RecorrenciaEnumMap: Record<string, RecorrenciaEnum> = {
  NUNCA: RecorrenciaEnum.Nunca,
  SEMANAL: RecorrenciaEnum.Semanal,
  MENSAL: RecorrenciaEnum.Mensal,
};

export const RecorrenciaEnumLabel: Record<RecorrenciaEnum, string> = {
  [RecorrenciaEnum.Nunca]: 'Nunca',
  [RecorrenciaEnum.Semanal]: 'Semanal',
  [RecorrenciaEnum.Mensal]: 'Mensal',
};
