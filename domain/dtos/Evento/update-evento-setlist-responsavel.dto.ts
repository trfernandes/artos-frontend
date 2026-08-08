import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';

export type UpdateEventoSetlistResponsavelDto = {
  ministerioId: string;
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  responsavelVoluntarioId?: string | null;
};

export type RemoveEventoSetlistResponsavelDto = {
  ministerioId: string;
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
};
