import { RecorrenciaDiaSemanaEnum } from '../../enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../../enums/Evento/recorrencia.enum';

export type CreateEventoDto = {
  igrejaId: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataTermino?: string;
  local?: string;
  cor: string;
  recorrencia: RecorrenciaEnum;
  recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
  recorrenciaACadaMeses?: number;
  recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
  templatePadraoId?: string;
};
