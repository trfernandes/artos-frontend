import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';

export type UpdateEventoTemplatePadraoDto = {
  ministerioId: string;
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  templatePadraoId: string | null;
};

export type RemoveEventoTemplatePadraoDto = {
  ministerioId: string;
  escopo: TemplatePadraoEscopoEnum;
  dataOcorrencia: string;
};
