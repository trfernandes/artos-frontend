import { RecorrenciaDiaSemanaEnum } from '../../enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../../enums/Evento/recorrencia.enum';
import { ResponseEscalaTemplateDto } from '../EscalaTemplate/escala-template.response';
import { ResponseEventoDto } from './evento.response';

export type ResponseEventoOcorrenciaDto = {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  cor: string;
  recorrencia: RecorrenciaEnum;
  recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
  recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
  recorrenciaACadaMeses?: number;
  dataOcorrencia: string;
  eventoId: string;
  evento?: ResponseEventoDto;
  templatePadraoId?: string;
  templatePadrao?: ResponseEscalaTemplateDto;
};
