import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import type { ResponseEscalaTemplateDto } from './escala-template.response';

export type ResponseEscalaTemplateFuncaoOpcaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  templateFuncaoId: string;
  funcaoId: string;
  funcao?: ResponseMinisterioFuncaoDto;
};

export type ResponseEscalaTemplateFuncaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  templateId: string;
  template?: ResponseEscalaTemplateDto;
  opcoes: ResponseEscalaTemplateFuncaoOpcaoDto[];
  quantidade: number;
  experiencia: EscalaTemplateExperienciaEnum;
};
