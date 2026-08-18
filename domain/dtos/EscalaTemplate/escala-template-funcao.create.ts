import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';

export type CreateEscalaTemplateFuncaoDto = {
  funcaoIds: string[];
  quantidade: number;
  experiencia: EscalaTemplateExperienciaEnum;
};
