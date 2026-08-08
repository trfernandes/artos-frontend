import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';

export type ResponseMinisterioVoluntarioFuncaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministerioVoluntarioId: string;
  ministerioVoluntario?: ResponseMinisterioVoluntarioDto;
  funcaoId: string;
  funcao?: ResponseMinisterioFuncaoDto;
  status: MinisterioVoluntarioFuncaoStatusEnum;
  experiencia: EscalaTemplateExperienciaEnum;
};
