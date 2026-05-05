import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';
import { IgrejaVoluntarioStatusEnum } from '../../enums/Igreja/voluntario-status.enum';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseIgrejaVoluntarioDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igreja: ResponseIgrejaDto;
  igrejaId: string;
  voluntarioId?: string;
  voluntario: ResponseVoluntarioDto;
  role: IgrejaVoluntarioRoleEnum;
  status: IgrejaVoluntarioStatusEnum;
};
