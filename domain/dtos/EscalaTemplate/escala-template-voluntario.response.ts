import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import { ResponseEscalaTemplateDto } from './escala-template.response';

export type ResponseEscalaTemplateVoluntarioDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  templateId: string;
  template?: ResponseEscalaTemplateDto;
  voluntarioId: string;
  voluntario?: ResponseVoluntarioDto;
  funcaoId: string;
  funcao?: ResponseMinisterioFuncaoDto;
};
