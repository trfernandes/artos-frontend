import { SexoEnum } from '../../enums/common/sexo-enum';
import { VoluntarioStatusEnum } from '../../enums/Voluntario/voluntario-status.enum';
import { ResponseIndisponibilidadeVoluntarioDto } from '../IndisponibilidadeVoluntario/indisponibilidade-voluntario.response';
import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';

export type ResponseVoluntarioDto = {
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
  fotoPublicId?: string;
  status: VoluntarioStatusEnum;
  ministerios?: ResponseMinisterioVoluntarioDto[];
  indisponibilidades?: ResponseIndisponibilidadeVoluntarioDto[];
};
