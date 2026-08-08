import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';

export type UpdateEventoEnsaioDto = {
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  horarioEnsaio: string;
  observacao?: string;
};

export type RemoveEventoEnsaioDto = {
  escopo: TemplatePadraoEscopoEnum;
  dataOcorrencia: string;
};

export type ResponseEventoEnsaioDto = {
  eventoId: string;
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  horarioEnsaio: string | null;
  horarioEnsaioOrigem: string | null;
  observacao: string | null;
};
