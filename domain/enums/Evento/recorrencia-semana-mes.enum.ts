export enum RecorrenciaSemanaMesEnum {
  Primeira = 'PRIMEIRA',
  Segunda = 'SEGUNDA',
  Terceira = 'TERCEIRA',
  Quarta = 'QUARTA',
  Quinta = 'QUINTA',
}

export const RecorrenciaSemanaMesEnumMap: Record<string, RecorrenciaSemanaMesEnum> = {
  PRIMEIRA: RecorrenciaSemanaMesEnum.Primeira,
  SEGUNDA: RecorrenciaSemanaMesEnum.Segunda,
  TERCEIRA: RecorrenciaSemanaMesEnum.Terceira,
  QUARTA: RecorrenciaSemanaMesEnum.Quarta,
  QUINTA: RecorrenciaSemanaMesEnum.Quinta,
};

export const RecorrenciaSemanaMesEnumOrder = [
  RecorrenciaSemanaMesEnum.Primeira,
  RecorrenciaSemanaMesEnum.Segunda,
  RecorrenciaSemanaMesEnum.Terceira,
  RecorrenciaSemanaMesEnum.Quarta,
  RecorrenciaSemanaMesEnum.Quinta,
] as const;

export const RecorrenciaSemanaMesEnumLabel: Record<RecorrenciaSemanaMesEnum, { extenso: string; abreviado: string }> = {
  [RecorrenciaSemanaMesEnum.Primeira]: { extenso: 'Primeira semana', abreviado: '1ª sem' },
  [RecorrenciaSemanaMesEnum.Segunda]: { extenso: 'Segunda semana', abreviado: '2ª sem' },
  [RecorrenciaSemanaMesEnum.Terceira]: { extenso: 'Terceira semana', abreviado: '3ª sem' },
  [RecorrenciaSemanaMesEnum.Quarta]: { extenso: 'Quarta semana', abreviado: '4ª sem' },
  [RecorrenciaSemanaMesEnum.Quinta]: { extenso: 'Quinta semana', abreviado: '5ª sem' },
};
