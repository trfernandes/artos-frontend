import { MetodoPagamentoEnum } from '../../enums/Igreja/metodo-pagamento.enum';

export type CriarCobrancaDto = {
  valorCentavos: number;
  moeda?: string;
  vencimento: string;
  metodo?: MetodoPagamentoEnum;
  referencia?: string | null;
};
