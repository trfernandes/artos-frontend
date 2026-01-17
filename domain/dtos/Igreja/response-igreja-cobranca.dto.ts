import { CobrancaStatusEnum } from '../../enums/Igreja/cobranca-status.enum';
import { MetodoPagamentoEnum } from '../../enums/Igreja/metodo-pagamento.enum';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseIgrejaCobrancaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  igreja: ResponseIgrejaDto;
  valorCentavos: number;
  moeda: string;
  vencimento: string;
  status: CobrancaStatusEnum;
  metodo: MetodoPagamentoEnum;
  referencia?: string | null;
  pagoEm?: Date | null;
};
