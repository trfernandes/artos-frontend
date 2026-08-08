export enum RecorrenciaDiaSemanaEnum {
  domingo = 'DOMINGO',
  segunda = 'SEGUNDA',
  terca = 'TERCA',
  quarta = 'QUARTA',
  quinta = 'QUINTA',
  sexta = 'SEXTA',
  sabado = 'SABADO',
}

export const RecorrenciaDiaSemanaEnumMap: Record<string, RecorrenciaDiaSemanaEnum> = {
  DOMINGO: RecorrenciaDiaSemanaEnum.domingo,
  SEGUNDA: RecorrenciaDiaSemanaEnum.segunda,
  TERCA: RecorrenciaDiaSemanaEnum.terca,
  QUARTA: RecorrenciaDiaSemanaEnum.quarta,
  QUINTA: RecorrenciaDiaSemanaEnum.quinta,
  SEXTA: RecorrenciaDiaSemanaEnum.sexta,
  SABADO: RecorrenciaDiaSemanaEnum.sabado,
};

export const RecorrenciaDiaSemanaEnumOrder = [
  RecorrenciaDiaSemanaEnum.domingo,
  RecorrenciaDiaSemanaEnum.segunda,
  RecorrenciaDiaSemanaEnum.terca,
  RecorrenciaDiaSemanaEnum.quarta,
  RecorrenciaDiaSemanaEnum.quinta,
  RecorrenciaDiaSemanaEnum.sexta,
  RecorrenciaDiaSemanaEnum.sabado,
] as const;

export const RecorrenciaDiaSemanaEnumLabel: Record<
  RecorrenciaDiaSemanaEnum,
  { extenso: string; abreviado: string }
> = {
  [RecorrenciaDiaSemanaEnum.domingo]: { extenso: 'Domingo', abreviado: 'Dom' },
  [RecorrenciaDiaSemanaEnum.segunda]: {
    extenso: 'Segunda-Feira',
    abreviado: 'Seg',
  },
  [RecorrenciaDiaSemanaEnum.terca]: { extenso: 'Terça-Feira', abreviado: 'Ter' },
  [RecorrenciaDiaSemanaEnum.quarta]: { extenso: 'Quarta-Feira', abreviado: 'Qua' },
  [RecorrenciaDiaSemanaEnum.quinta]: { extenso: 'Quinta-Feira', abreviado: 'Qui' },
  [RecorrenciaDiaSemanaEnum.sexta]: { extenso: 'Sexta-Feira', abreviado: 'Sex' },
  [RecorrenciaDiaSemanaEnum.sabado]: { extenso: 'Sábado', abreviado: 'Sáb' },
};
