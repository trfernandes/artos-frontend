import { Escala } from './Escala';
import { MinisterioFuncao } from './MinisterioFuncao';
import { Voluntario } from './Voluntario';

export interface EscalaVoluntario {
  escala?: Escala;
  escalaId: string;
  voluntario?: Voluntario;
  voluntarioId: string;
  funcao?: MinisterioFuncao;
  funcaoId: string;
  status: EscalaVoluntarioStatusEnum;
  substituto: Voluntario;
  observacoes?: string;
}

export enum EscalaVoluntarioStatusEnum {
  Pendente = '0',
  Confirmado = '1',
  Substituido = '2',
  Ausente = '3',
}
