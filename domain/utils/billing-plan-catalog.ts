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
    descricao: 'Para igrejas que estao estruturando a operacao sem abrir mao do essencial.',
    monthlyPrice: 'R$ 39,90/mês',
    yearlyPrice: 'R$ 383,04/ano',
    maxVolunteers: 30,
    maxMinistries: 3,
  },
  {
    codigo: 'essencial',
    nome: 'Essencial',
    descricao: 'Faixa recomendada para igrejas com mais equipes e rotinas semanais.',
    monthlyPrice: 'R$ 59,90/mês',
    yearlyPrice: 'R$ 575,04/ano',
    maxVolunteers: 80,
    maxMinistries: 6,
    highlight: 'Mais escolhido',
  },
  {
    codigo: 'crescimento',
    nome: 'Crescimento',
    descricao: 'Para igrejas maiores, com varios ministerios e escala recorrente intensa.',
    monthlyPrice: 'R$ 119,90/mês',
    yearlyPrice: 'R$ 1.151,04/ano',
    maxVolunteers: 180,
    maxMinistries: 12,
  },
] as const;

export function resolveBillingPlanName(plan?: BillingPlanCode | string | null) {
  if (!plan || plan === 'free') return 'Gratuito';
  return BILLING_PLAN_OPTIONS.find((option) => option.codigo === plan)?.nome ?? 'Plano ativo';
}
