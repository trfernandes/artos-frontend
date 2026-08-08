import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';

export type UpdateEventoTemplatePadraoDto = {
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  templatePadraoId: string | null;
};

export type RemoveEventoTemplatePadraoDto = {
  escopo: TemplatePadraoEscopoEnum;
  dataOcorrencia: string;
};
