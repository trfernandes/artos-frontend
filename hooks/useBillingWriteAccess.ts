import { useAuth } from '../contexts/AuthContext';
import { isPlanLimitReached, isSubscriptionWriteBlocked } from '../domain/utils/billing-notice';
import { useIgrejaAssinatura } from './useIgrejaAssinatura';

export function useBillingWriteAccess() {
  const { igrejaAtiva } = useAuth();
  const { data: assinatura } = useIgrejaAssinatura({
    igrejaId: igrejaAtiva?.id,
    autoFetch: !!igrejaAtiva?.id,
  });

  return {
    isBlocked: isSubscriptionWriteBlocked(assinatura),
    isVolunteerLimitReached: isPlanLimitReached(assinatura, 'volunteers'),
    isMinistryLimitReached: isPlanLimitReached(assinatura, 'ministries'),
    assinatura,
  };
}
