import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';

export type ResponseMinisterioVoluntarioFuncaoHistDto = {
  ministerioVoluntarioId: string;
  ministerioVoluntario?: ResponseMinisterioVoluntarioDto | null;
  funcaoId: string;
  funcao?: ResponseMinisterioFuncaoDto | null;
  status: MinisterioVoluntarioFuncaoStatusEnum;
  experienciaNaEpoca?: EscalaTemplateExperienciaEnum | null;
  dataInicio: Date;
  dataTermino?: Date | null;
};
