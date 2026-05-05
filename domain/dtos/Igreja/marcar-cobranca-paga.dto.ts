import { MetodoPagamentoEnum } from '../../enums/Igreja/metodo-pagamento.enum';

export class MarcarCobrancaPagaDto {
  metodo?: MetodoPagamentoEnum;
  pagoEm?: string;
}
