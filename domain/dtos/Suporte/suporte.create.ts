import { SuporteTipoEnum } from '../../enums/Suporte/suporte-tipo.enum';

export type CreateSuporteDto = {
  tipo: SuporteTipoEnum;
  texto: string;
  igrejaId: string;
};
