import { SexoEnum } from '../../enums/common/sexo-enum';
import { VoluntarioStatusEnum } from '../../enums/Voluntario/voluntario-status.enum';
import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';
import { IgrejaVoluntarioStatusEnum } from '../../enums/Igreja/voluntario-status.enum';

export type ResponseVoluntarioIgrejaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  nome: string;
  email: string;
  dataNascimento?: string;
  endereco?: string;
  telefone?: string;
  sexo: SexoEnum;
  fotoUrl: string;
  fotoThumbUrl?: string;
  status: VoluntarioStatusEnum;
  emailVerifiedAt?: string;
  igrejaVoluntarioId: string;
  role: IgrejaVoluntarioRoleEnum;
  statusVinculo: IgrejaVoluntarioStatusEnum;
  vinculadoEm: string;
};
