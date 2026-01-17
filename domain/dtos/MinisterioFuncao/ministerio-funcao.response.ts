import { MinisterioFuncaoStatusEnum } from '../../enums/MinisterioFuncao/ministerio-funcao-status.enum';
import { ResponseMinisterioDto } from '../Ministerio/ministerio.response';

export type ResponseMinisterioFuncaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministerio: ResponseMinisterioDto;
  ministerioId: string;
  nome: string;
  descricao?: string;
  status: MinisterioFuncaoStatusEnum;
};
