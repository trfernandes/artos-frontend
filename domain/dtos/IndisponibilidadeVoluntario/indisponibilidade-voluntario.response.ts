import { ResponseIgrejaDto } from '../Igreja/response-igreja.dto';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';

export type ResponseIndisponibilidadeVoluntarioDto = {
  id: string;
  igrejaId: string;
  igreja?: ResponseIgrejaDto;
  data: string;
  motivo?: string;
  voluntario?: ResponseVoluntarioDto;
  voluntarioId: string;
  createdAt: string;
  updatedAt: string;
};
