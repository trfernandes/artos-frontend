import { AssinaturaPeriodicidadeEnum } from '../../enums/Igreja/assinatura-periodicidade.enum';

export type AlterarPlanoDto = {
  plano: string;
  periodicidade?: AssinaturaPeriodicidadeEnum;
  aplicarNaProximaRenovacao?: boolean;
};
