export type BillingPlanCode = 'free' | 'starter' | 'essencial' | 'crescimento';
export type BillingCycleCode = 'MONTHLY' | 'YEARLY';

export type BillingPlanOption = {
  codigo: Exclude<BillingPlanCode, 'free'>;
  nome: string;
  descricao: string;
  monthlyPrice: string;
  yearlyPrice: string;
  maxVolunteers: number;
  maxMinistries: number;
  highlight?: string;
};

export const BILLING_PLAN_OPTIONS: readonly BillingPlanOption[] = [
  {
    codigo: 'starter',
    nome: 'Starter',
    descricao: 'Para igrejas que estao organizando a operacao inicial.',
    monthlyPrice: 'R$ 39,90/mês',
    yearlyPrice: 'R$ 383,00/ano',
    maxVolunteers: 30,
    maxMinistries: 3,
  },
  {
    codigo: 'essencial',
    nome: 'Essencial',
    descricao: 'Ideal para igrejas com equipes ativas e rotina semanal.',
    monthlyPrice: 'R$ 59,90/mês',
    yearlyPrice: 'R$ 575,00/ano',
    maxVolunteers: 80,
    maxMinistries: 6,
    highlight: 'Mais escolhido',
  },
  {
    codigo: 'crescimento',
    nome: 'Crescimento',
    descricao: 'Para operacoes maiores, com mais ministerios e escala recorrente.',
    monthlyPrice: 'R$ 119,90/mês',
    yearlyPrice: 'R$ 1.151,00/ano',
    maxVolunteers: 180,
    maxMinistries: 12,
  },
] as const;

export function resolveBillingPlanName(plan?: BillingPlanCode | string | null) {
  if (!plan || plan === 'free') return 'Gratuito';
  return BILLING_PLAN_OPTIONS.find((option) => option.codigo === plan)?.nome ?? 'Plano ativo';
}
