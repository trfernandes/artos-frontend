import { EscalaTemplateTipoEnum } from '../../enums/EscalaTemplate/escala-template-tipo.enum';
import { ResponseMinisterioDto } from '../Ministerio/ministerio.response';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import type { ResponseEscalaTemplateFuncaoDto } from './escala-template-funcao.response';
import type { ResponseEscalaTemplateVoluntarioDto } from './escala-template-voluntario.response';

export type ResponseEscalaTemplateDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministerioId: string;
  ministerio?: ResponseMinisterioDto;
  nome: string;
  tipo: EscalaTemplateTipoEnum;
  respSetListVoluntariosId?: string;
  respSetListVoluntarios?: ResponseVoluntarioDto;
  respSetListFuncoesId?: string;
  respSetListFuncoes?: ResponseMinisterioFuncaoDto;
  voluntarios?: ResponseEscalaTemplateVoluntarioDto[];
  funcoes?: ResponseEscalaTemplateFuncaoDto[];
};
