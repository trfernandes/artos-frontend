import { MinisterioVoluntarioStatusEnum } from '../../models/MinisterioVoluntario';
import type { CreateMinisterioVoluntarioDto } from './ministerio-voluntario.create';

export type UpdateMinisterioVoluntarioDto = Partial<CreateMinisterioVoluntarioDto> & {
  status?: MinisterioVoluntarioStatusEnum;
};
