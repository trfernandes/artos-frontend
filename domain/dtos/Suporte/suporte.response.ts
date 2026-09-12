import { SuporteTipoEnum } from '../../enums/Suporte/suporte-tipo.enum';

export type ResponseSuporteDto = {
  id: string;
  tipo: SuporteTipoEnum;
  texto: string;
  igrejaId: string;
  voluntarioId?: string | null;
  createdAt: string;
};
