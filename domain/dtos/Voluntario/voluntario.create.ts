import { SexoEnum } from '../../enums/common/sexo-enum';

export type CreateVoluntarioDto = {
  nome: string;
  email: string;
  senha: string;
  dataNascimento?: string;
  endereco?: string;
  telefone?: string;
  sexo: SexoEnum;
  fotoUrl: string | null;
  fotoThumbUrl?: string | null;
};
