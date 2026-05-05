import { ResponseIgrejaDto } from './response-igreja.dto';
import { ResponseIgrejaConviteDto } from './response-igreja-convite.dto';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';

export type SolicitacaoStatusEnum = 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELED';

export type ResponseIgrejaSolicitacaoDto = {
  id: string;
  igreja: ResponseIgrejaDto;
  voluntario: ResponseVoluntarioDto;
  convite?: ResponseIgrejaConviteDto;
  status: SolicitacaoStatusEnum;
  message?: string;
  respondedAt?: string;
  createdAt: string;
};
