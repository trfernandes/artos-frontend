import { AssinaturaPeriodicidadeEnum } from '../../enums/Igreja/assinatura-periodicidade.enum';

export type CriarCheckoutAssinaturaDto = {
  plano: string;
  periodicidade: AssinaturaPeriodicidadeEnum;
  cupomCodigo?: string;
};
