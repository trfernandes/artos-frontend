import { Identifiable } from './Indentifiable';

export interface Evento extends Identifiable {
  nome: string;
  descricao?: string;
  dataInicio: Date;
  dataTermino: Date;
  local?: string;
  cor?: string;
  recorrencia?: RecorrenciaEnum;
  recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
  recorrenciaACadaMeses?: number;
  recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
}

export enum RecorrenciaDiaSemanaEnum {
  domingo = 1,
  segunda = 2,
  terca = 3,
  quarta = 4,
  quinta = 5,
  sexta = 6,
  sabado = 7,
}

export const RecorrenciaDiaSemanaEnumMap: Record<number, RecorrenciaDiaSemanaEnum> = {
  0: RecorrenciaDiaSemanaEnum.domingo,
  1: RecorrenciaDiaSemanaEnum.segunda,
  2: RecorrenciaDiaSemanaEnum.terca,
  3: RecorrenciaDiaSemanaEnum.quarta,
  4: RecorrenciaDiaSemanaEnum.quinta,
  5: RecorrenciaDiaSemanaEnum.sexta,
  6: RecorrenciaDiaSemanaEnum.sabado,
};

export const RecorrenciaDiaSemanaEnumLabel: Record<
  RecorrenciaDiaSemanaEnum,
  { extenso: string; abreviado: string }
> = {
  [RecorrenciaDiaSemanaEnum.domingo]: { extenso: 'Domingo', abreviado: 'Dom' },
  [RecorrenciaDiaSemanaEnum.segunda]: { extenso: 'Segunda-Feira', abreviado: 'Seg' },
  [RecorrenciaDiaSemanaEnum.terca]: { extenso: 'Terça-Feira', abreviado: 'Ter' },
  [RecorrenciaDiaSemanaEnum.quarta]: { extenso: 'Quarta-Feira', abreviado: 'Qua' },
  [RecorrenciaDiaSemanaEnum.quinta]: { extenso: 'Quinta-Feira', abreviado: 'Qui' },
  [RecorrenciaDiaSemanaEnum.sexta]: { extenso: 'Sexta-Feira', abreviado: 'Sex' },
  [RecorrenciaDiaSemanaEnum.sabado]: { extenso: 'Sábado', abreviado: 'Sáb' },
};

export enum RecorrenciaEnum {
  Nunca = 0,
  Semanal = 1,
  Mensal = 2,
}

export const RecorrenciaEnumMap: Record<number, RecorrenciaEnum> = {
  0: RecorrenciaEnum.Nunca,
  1: RecorrenciaEnum.Semanal,
  2: RecorrenciaEnum.Mensal,
};

export const RecorrenciaEnumLabel: Record<RecorrenciaEnum, string> = {
  [RecorrenciaEnum.Nunca]: 'Nunca',
  [RecorrenciaEnum.Semanal]: 'Semanal',
  [RecorrenciaEnum.Mensal]: 'Mensal',
};

export enum RecorrenciaSemanaMesEnum {
  Primeira = 1,
  Segunda = 2,
  Terceira = 3,
  Quarta = 4,
  Quinta = 5,
}

export const RecorrenciaSemanaMesEnumMap: Record<number, RecorrenciaSemanaMesEnum> = {
  0: RecorrenciaSemanaMesEnum.Primeira,
  1: RecorrenciaSemanaMesEnum.Segunda,
  2: RecorrenciaSemanaMesEnum.Terceira,
  3: RecorrenciaSemanaMesEnum.Quarta,
  4: RecorrenciaSemanaMesEnum.Quinta,
};

export const RecorrenciaSemanaMesEnumLabel: Record<
  RecorrenciaSemanaMesEnum,
  { extenso: string; abreviado: string }
> = {
  [RecorrenciaSemanaMesEnum.Primeira]: { extenso: 'Primeira semana', abreviado: '1ª sem' },
  [RecorrenciaSemanaMesEnum.Segunda]: { extenso: 'Segunda semana', abreviado: '2ª sem' },
  [RecorrenciaSemanaMesEnum.Terceira]: { extenso: 'Terceira semana', abreviado: '3ª sem' },
  [RecorrenciaSemanaMesEnum.Quarta]: { extenso: 'Quarta semana', abreviado: '4ª sem' },
  [RecorrenciaSemanaMesEnum.Quinta]: { extenso: 'Quinta semana', abreviado: '5ª sem' },
};
