import { MinisterioVoluntarioStatusEnum } from '../../enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import type { CreateMinisterioVoluntarioDto } from './ministerio-voluntario.create';

export type UpdateMinisterioVoluntarioDto = Partial<CreateMinisterioVoluntarioDto> & {
  status?: MinisterioVoluntarioStatusEnum;
};
