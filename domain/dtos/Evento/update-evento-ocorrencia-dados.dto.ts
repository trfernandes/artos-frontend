import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';
import { TemplatePadraoOrigemEnum } from '../../enums/Evento/template-padrao-origem.enum';

export type UpdateEventoOcorrenciaDadosDto = {
  dataReferencia: string;
  escopo: TemplatePadraoEscopoEnum;
  dataInicio?: string;
  dataTermino?: string;
  local?: string;
};

export type RemoveEventoOcorrenciaDadosDto = {
  escopo: TemplatePadraoEscopoEnum;
  dataReferencia: string;
};

export type ResponseEventoOcorrenciaDadosDto = {
  eventoId: string;
  dataReferencia: string;
  escopo: TemplatePadraoEscopoEnum;
  dataInicio: string;
  dataTermino: string | null;
  local: string | null;
  dadosOcorrenciaOrigem: TemplatePadraoOrigemEnum;
};
