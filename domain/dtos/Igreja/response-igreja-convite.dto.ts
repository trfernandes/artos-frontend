import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseIgrejaConviteDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igreja: ResponseIgrejaDto;
  igrejaId: string;
  token: string;
  roleSugerida?: IgrejaVoluntarioRoleEnum | null;
  autoApprove: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  usesCount: number;
  ativo: boolean;
};
