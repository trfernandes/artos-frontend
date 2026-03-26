import { TemplatePadraoEscopoEnum } from '../../enums/Evento/template-padrao-escopo.enum';

export type UpdateEventoSetlistResponsavelDto = {
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
  responsavelVoluntarioId?: string | null;
};

export type RemoveEventoSetlistResponsavelDto = {
  dataOcorrencia: string;
  escopo: TemplatePadraoEscopoEnum;
};
