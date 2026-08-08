import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import type { ResponseEscalaTemplateDto } from './escala-template.response';

export type ResponseEscalaTemplateFuncaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  templateId: string;
  template?: ResponseEscalaTemplateDto;
  funcaoId: string;
  funcao?: ResponseMinisterioFuncaoDto;
  quantidade: number;
  experiencia: EscalaTemplateExperienciaEnum;
};
