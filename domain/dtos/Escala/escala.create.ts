import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { EscalaTemplateTipoEnum } from '../../enums/EscalaTemplate/escala-template-tipo.enum';

export type CreateEscalaTemplateFuncaoDto = {
  id: string;
  quantidade: number;
  experienciaMinima: EscalaTemplateExperienciaEnum;
};

export type CreateEscalaTemplateFixoDto = {
  minVolId: string;
  funcaoId: string;
};

export type CreateEscalaEventoEquipePersonalizadaDto = {
  origem: 'personalizada';
  tipo: EscalaTemplateTipoEnum;
  funcoes?: CreateEscalaTemplateFuncaoDto[];
  fixos?: CreateEscalaTemplateFixoDto[];
};

export type CreateEscalaEventoEquipePorTemplateDto = {
  origem: 'porTemplate';
  templateId: string;
};

export type CreateEscalaEventoEquipeDto =
  CreateEscalaEventoEquipePorTemplateDto | CreateEscalaEventoEquipePersonalizadaDto;

export type CreateEscalaEventoDto = {
  id: string;
  data: string;
  equipe: CreateEscalaEventoEquipeDto;
};

export type CreateEscalaParticipanteDto = {
  voluntarioId: string;
  minVolId: string;
};

export type CreateEscalaDto = {
  ministerioId: string;
  nome: string;
  dataInicio: string;
  dataTermino: string;
  eventos?: CreateEscalaEventoDto[];
  participantes?: CreateEscalaParticipanteDto[];
  criadoPor: string;
};
