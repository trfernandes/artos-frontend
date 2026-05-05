import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';

export type CreateMinisterioVoluntarioFuncaoDto = {
  ministerioVoluntarioId: string;
  funcaoId: string;
  status?: MinisterioVoluntarioFuncaoStatusEnum;
  experiencia?: EscalaTemplateExperienciaEnum;
};
