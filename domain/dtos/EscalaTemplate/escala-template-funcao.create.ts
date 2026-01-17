import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';

export type CreateEscalaTemplateFuncaoDto = {
  funcaoId: string;
  quantidade: number;
  experiencia: EscalaTemplateExperienciaEnum;
};
