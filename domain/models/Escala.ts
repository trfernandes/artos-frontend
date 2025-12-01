import { EscalaResultado } from './EscalaResultado';
import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';

export enum EscalaStatusEnum {
  Gerada = '1',
  Publicada = '2',
  Concluida = '3',
}

export const EscalaStatusEnumLabel: Record<EscalaStatusEnum, string> = {
  [EscalaStatusEnum.Gerada]: 'Gerada',
  [EscalaStatusEnum.Publicada]: 'Publicada',
  [EscalaStatusEnum.Concluida]: 'Concluída',
};

export interface Escala extends Identifiable {
  ministerio: Ministerio;
  dataInicio: Date;
  dataTermino: Date;
  nome: string;
  status: EscalaStatusEnum;
  parametrizacao: {
    eventos: Array<{
      id: string;
      date: string;
      name: string;
      equipe: {
        id: string;
        tipo: string;
        funcoes: Array<{ id: string; nome: string; expMinima: string }>;
        fixos: Array<{ voluntarioId: string; funcaoId: string }>;
      };
    }>;
    participantes: Array<{ id: string; name: string }>;
  };
  resultado: EscalaResultado[];
}
