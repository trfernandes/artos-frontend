import { EscalaStatusEnum } from '../../enums/Escala/escala-status.enum';
import { CreateEscalaDto } from './escala.create';

export type UpdateEscalaDto = Partial<CreateEscalaDto> & {
  status: EscalaStatusEnum;
};
