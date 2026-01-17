import { IgrejaJoinModeEnum } from '../../enums/Igreja/mode.enum';
import { IgrejaStatusEnum } from '../../enums/Igreja/status.enum';

export type ResponseIgrejaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  nome: string;
  cidade?: string | null;
  uf?: string | null;
  codigo: string;
  joinMode: IgrejaJoinModeEnum;
  status: IgrejaStatusEnum;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
};
