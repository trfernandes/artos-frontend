import { EscalaTemplateExperienciaEnum } from '../../enums/EscalaTemplate/escala-template-experiencia.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../models/MinisterioVoluntarioFuncao';

export type CreateMinisterioVoluntarioFuncaoDto = {
  ministerioVoluntarioId: string;
  funcaoId: string;
  status?: MinisterioVoluntarioFuncaoStatusEnum;
  experiencia?: EscalaTemplateExperienciaEnum;
};
