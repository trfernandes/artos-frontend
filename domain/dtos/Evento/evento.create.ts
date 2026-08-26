import { RecorrenciaDiaSemanaEnum } from '../../enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../../enums/Evento/recorrencia.enum';
import { EventoTipoEnum } from '../../enums/Evento/evento-tipo.enum';

export type CreateEventoDto = {
  igrejaId: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataTermino?: string;
  dataFimRecorrencia?: string;
  local?: string;
  cor: string;
  tipo?: EventoTipoEnum;
  recorrencia: RecorrenciaEnum;
  recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
  recorrenciaACadaMeses?: number;
  recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
  templatePadraoId?: string;
  horarioEnsaioPadrao?: string;
};
