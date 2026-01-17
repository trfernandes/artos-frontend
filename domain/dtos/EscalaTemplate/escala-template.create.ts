import { EscalaTemplateTipoEnum } from '../../models/EscalaTemplate';
import type { CreateEscalaTemplateFuncaoDto } from './escala-template-funcao.create';
import type { CreateEscalaTemplateVoluntarioDto } from './escala-template-voluntario.create';

export type CreateEscalaTemplateDto = {
  ministerioId: string;
  nome: string;
  tipo: EscalaTemplateTipoEnum;
  respSetListVoluntarios?: string;
  respSetListFuncoes?: string;
  voluntarios?: CreateEscalaTemplateVoluntarioDto[];
  funcoes?: CreateEscalaTemplateFuncaoDto[];
};
