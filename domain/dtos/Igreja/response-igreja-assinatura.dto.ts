export type ResponseIgrejaAssinaturaDto = {
  status: 'trial' | 'active' | 'overdue' | 'cancelled' | 'expired' | 'free';
  plan: 'free' | 'starter' | 'essencial' | 'crescimento';
  amount: number;
  cycle: 'MONTHLY' | 'YEARLY';
  checkoutUrl?: string | null;
  trialEndsAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelledAt?: string | null;
  daysRemainingInTrial: number;
  inGracePeriod: boolean;
  canManageBilling: boolean;
  hasPendingPlanChange?: boolean;
  currentVolunteers: number;
  currentMinistries: number;
  maxVolunteers: number;
  maxMinistries: number;
};
