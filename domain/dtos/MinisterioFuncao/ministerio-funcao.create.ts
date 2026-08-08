import { MinisterioFuncaoStatusEnum } from '../../enums/MinisterioFuncao/ministerio-funcao-status.enum';

export type CreateMinisterioFuncaoDto = {
  ministerioId: string;
  nome: string;
  descricao?: string;
  status: MinisterioFuncaoStatusEnum;
};
