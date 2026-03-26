import { RecorrenciaDiaSemanaEnum } from '../../enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../../enums/Evento/recorrencia.enum';
import { TemplatePadraoOrigemEnum } from '../../enums/Evento/template-padrao-origem.enum';
import { ResponseEscalaTemplateDto } from '../EscalaTemplate/escala-template.response';
import { ResponseIgrejaDto } from '../Igreja/response-igreja.dto';

export type ResponseEventoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId:string;
  igreja?: ResponseIgrejaDto;
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
  templatePadrao?: ResponseEscalaTemplateDto;
  templatePadraoOrigem?: TemplatePadraoOrigemEnum;
  horarioEnsaioPadrao?: string;
};
