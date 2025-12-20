import { EscalaTemplate } from './EscalaTemplate';
import { Identifiable } from './Indentifiable';

export interface Evento extends Identifiable {
  nome: string;
  descricao?: string;
  dataInicio: Date;
  dataTermino: Date | null;
  local?: string;
  cor?: string;
  recorrencia?: RecorrenciaEnum;
  recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
  recorrenciaACadaMeses?: number;
  recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
  templatePadrao?: EscalaTemplate;
  templatePadraoId?: string;
}

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
  'DOMINGO': RecorrenciaDiaSemanaEnum.domingo,
  'SEGUNDA': RecorrenciaDiaSemanaEnum.segunda,
  'TERCA': RecorrenciaDiaSemanaEnum.terca,
  'QUARTA': RecorrenciaDiaSemanaEnum.quarta,
  'QUINTA': RecorrenciaDiaSemanaEnum.quinta,
  'SEXTA': RecorrenciaDiaSemanaEnum.sexta,
  'SABADO': RecorrenciaDiaSemanaEnum.sabado,
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
  Nunca = 'NUNCA',
  Semanal = 'SEMANAL',
  Mensal = 'MENSAL',
}


export const RecorrenciaEnumMap: Record<string, RecorrenciaEnum> = {
  'NUNCA': RecorrenciaEnum.Nunca,
  'SEMANAL': RecorrenciaEnum.Semanal,
  'MENSAL': RecorrenciaEnum.Mensal,
};

export const RecorrenciaEnumLabel: Record<RecorrenciaEnum, string> = {
  [RecorrenciaEnum.Nunca]: 'Nunca',
  [RecorrenciaEnum.Semanal]: 'Semanal',
  [RecorrenciaEnum.Mensal]: 'Mensal',
};

export enum RecorrenciaSemanaMesEnum {
  Primeira = 'PRIMEIRA',
  Segunda = 'SEGUNDA',
  Terceira = 'TERCEIRA',
  Quarta = 'QUARTA',
  Quinta = 'QUINTA',
}


export const RecorrenciaSemanaMesEnumMap: Record<string, RecorrenciaSemanaMesEnum> = {
  'PRIMEIRA': RecorrenciaSemanaMesEnum.Primeira,
  'SEGUNDA': RecorrenciaSemanaMesEnum.Segunda,
  'TERCEIRA': RecorrenciaSemanaMesEnum.Terceira,
  'QUARTA': RecorrenciaSemanaMesEnum.Quarta,
  'QUINTA': RecorrenciaSemanaMesEnum.Quinta,
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
