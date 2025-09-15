import { Identifiable } from './Indentifiable';

export interface Evento extends Identifiable {
  nome: string;
  descricao: string;
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
  domingo = 0,
  segunda = 1,
  terca = 2,
  quarta = 3,
  quinta = 4,
  sexta = 5,
  sabado = 6,
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

export const RecorrenciaDiaSemanaEnumLabel: Record<RecorrenciaDiaSemanaEnum, { extenso: string; abreviado: string }> = {
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
  Primeira = 0,
  Segunda = 1,
  Terceira = 2,
  Quarta = 3,
  Quinta = 4,
}

export const RecorrenciaSemanaMesEnumMap: Record<number, RecorrenciaSemanaMesEnum> = {
  0: RecorrenciaSemanaMesEnum.Primeira,
  1: RecorrenciaSemanaMesEnum.Segunda,
  2: RecorrenciaSemanaMesEnum.Terceira,
  3: RecorrenciaSemanaMesEnum.Quarta,
  4: RecorrenciaSemanaMesEnum.Quinta,
};

export const RecorrenciaSemanaMesEnumLabel: Record<RecorrenciaSemanaMesEnum, string> = {
  [RecorrenciaSemanaMesEnum.Primeira]: 'Primeira semana',
  [RecorrenciaSemanaMesEnum.Segunda]: 'Segunda semana',
  [RecorrenciaSemanaMesEnum.Terceira]: 'Terceira semana',
  [RecorrenciaSemanaMesEnum.Quarta]: 'Quarta semana',
  [RecorrenciaSemanaMesEnum.Quinta]: 'Quinta semana',
};
