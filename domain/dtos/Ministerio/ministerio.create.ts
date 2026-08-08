import { MinisterioStatusEnum } from '../../enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoEnum } from '../../enums/Ministerio/ministerio-tipo.enum';

export type CreateMinisterioDto = {
  igrejaId: string;
  nome: string;
  descricao?: string;
  tipo: MinisterioTipoEnum;
  status: MinisterioStatusEnum;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
};
