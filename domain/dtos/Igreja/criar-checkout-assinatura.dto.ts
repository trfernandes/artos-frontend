export type CriarCheckoutAssinaturaDto = {
  churchId: string;
  plan: 'starter' | 'essencial' | 'crescimento';
  cycle?: 'MONTHLY' | 'YEARLY';
  changePlan?: boolean;
};
