import { MinisterioFuncaoStatusEnum } from '../../models/MinisterioFuncao';

export type CreateMinisterioFuncaoDto = {
  ministerioId: string;
  nome: string;
  descricao?: string;
  status: MinisterioFuncaoStatusEnum;
};
