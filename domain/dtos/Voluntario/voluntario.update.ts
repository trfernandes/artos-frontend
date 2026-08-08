import { VoluntarioStatusEnum } from '../../enums/Voluntario/voluntario-status.enum';
import type { CreateVoluntarioDto } from './voluntario.create';

export type UpdateVoluntarioDto = Partial<CreateVoluntarioDto> & {
  status?: VoluntarioStatusEnum;
};
