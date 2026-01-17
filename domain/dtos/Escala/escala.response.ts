import { EscalaStatusEnum } from '../../enums/Escala/escala-status.enum';
import { ResponseMinisterioDto } from '../Ministerio/ministerio.response';
import type { ResponseEscalaItemDto } from './escala-item.response';

export type ResponseEscalaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministerioId: string;
  ministerio?: ResponseMinisterioDto;
  dataInicio: string;
  dataTermino: string;
  nome: string;
  status: EscalaStatusEnum;
  parametrizacao?: string;
  itens: ResponseEscalaItemDto[];
};
