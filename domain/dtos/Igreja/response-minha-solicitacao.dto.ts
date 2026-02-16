import { IgrejaVoluntarioStatusEnum } from '../../enums/Igreja/voluntario-status.enum';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseMinhaSolicitacaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igreja: ResponseIgrejaDto;
  status: IgrejaVoluntarioStatusEnum;
  motivoRejeicao?: string | null;
};
