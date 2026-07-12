import { useAuth } from '../contexts/AuthContext';
import { isPlanLimitReached, isSubscriptionWriteBlocked } from '../domain/utils/billing-notice';
import { BILLING_STATUS_VISIBLE } from '../domain/utils/billing-platform';
import { useIgrejaAssinatura } from './useIgrejaAssinatura';

export function useBillingWriteAccess() {
  const { igrejaAtiva } = useAuth();
  const { data: assinatura, abrirPortalDeAssinatura } = useIgrejaAssinatura({
    igrejaId: igrejaAtiva?.id,
    autoFetch: !!igrejaAtiva?.id,
  });
  const canManageBilling = Boolean(assinatura?.canManageBilling);

  return {
    isBlocked: isSubscriptionWriteBlocked(assinatura),
    isVolunteerLimitReached: isPlanLimitReached(assinatura, 'volunteers'),
    isMinistryLimitReached: isPlanLimitReached(assinatura, 'ministries'),
    assinatura,
    canManageBilling,
    abrirPortalDeAssinatura,
    showBillingBanner: BILLING_STATUS_VISIBLE,
    // Quem não é ADMIN não recebe token de portal (backend nega) — nem oferecer o CTA.
    billingBlockedMessage: canManageBilling
      ? null
      : 'Fale com o administrador da igreja para liberar mais acesso.',
  };
}
