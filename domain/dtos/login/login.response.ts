import { MinisterioTipoEnum } from '../../enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../enums/MinisterioVoluntario/hierarquia.enum';
import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';

export type ResponseLoginMinisterioDto = {
  id: string;
  nome: string;
  hierarquia: VoluntarioHierarquiaEnum;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
  tipo?: MinisterioTipoEnum;
};

export type ResponseLoginIgrejaDto = {
  id: string;
  nome: string;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
  role: IgrejaVoluntarioRoleEnum;
  ministerios: ResponseLoginMinisterioDto[];
};

export type ResponseLoginUserDto = {
  id: string;
  nome: string;
  email: string;
  fotoUrl?: string | null;
  fotoThumbUrl?: string | null;
};

export type ResponseLoginDto = {
  access_token: string;
  user: ResponseLoginUserDto;
  igrejas: ResponseLoginIgrejaDto[];
};
