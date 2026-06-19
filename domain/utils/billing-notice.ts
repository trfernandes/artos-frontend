import { ResponseIgrejaAssinaturaDto } from '../dtos/Igreja/response-igreja-assinatura.dto';

export type BillingTrialPhase = 'early' | 'warning' | 'ending' | 'expired' | 'none';

export type BillingPrimaryActionLabel =
  | 'Assinar agora'
  | 'Ver planos'
  | 'Atualizar plano'
  | 'Retomar pagamento'
  | 'Escolher plano'
  | 'Reativar assinatura';

export type BillingNoticeContent = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: BillingPrimaryActionLabel;
  tone: 'info' | 'warning' | 'critical';
};

export function isSubscriptionWriteBlocked(assinatura?: ResponseIgrejaAssinaturaDto | null): boolean {
  if (!assinatura) return false;
  const phase = resolveBillingTrialPhase(assinatura);
  if (phase === 'expired') return true;
  if (assinatura.status === 'expired') return true;
  if (assinatura.status === 'overdue') return true;
  if (assinatura.status === 'cancelled') {
    return !assinatura.currentPeriodEnd || new Date(assinatura.currentPeriodEnd) < new Date();
  }
  return false;
}

export function isPlanLimitReached(
  assinatura: ResponseIgrejaAssinaturaDto | null | undefined,
  type: 'volunteers' | 'ministries',
): boolean {
  if (!assinatura) return false;
  if (type === 'volunteers') return assinatura.currentVolunteers >= assinatura.maxVolunteers;
  return assinatura.currentMinistries >= assinatura.maxMinistries;
}

export function hasPendingCheckout(assinatura?: ResponseIgrejaAssinaturaDto | null) {
  return Boolean(assinatura?.checkoutUrl) && assinatura?.status !== 'cancelled';
}

export function hasExceededPlanCapacity(assinatura?: ResponseIgrejaAssinaturaDto | null) {
  if (!assinatura) return false;
  return (
    assinatura.currentVolunteers > assinatura.maxVolunteers ||
    assinatura.currentMinistries > assinatura.maxMinistries
  );
}

export function resolveBillingPrimaryActionLabel(
  assinatura?: ResponseIgrejaAssinaturaDto | null,
): BillingPrimaryActionLabel {
  if (!assinatura) return 'Ver planos';

  if (hasPendingCheckout(assinatura)) {
    return 'Retomar pagamento';
  }

  if (hasExceededPlanCapacity(assinatura) && assinatura.status !== 'cancelled') {
    return 'Atualizar plano';
  }

  if (assinatura.status === 'trial') {
    return 'Assinar agora';
  }

  if (assinatura.status === 'expired') {
    return 'Escolher plano';
  }

  if (assinatura.status === 'overdue') {
    return 'Retomar pagamento';
  }

  if (assinatura.status === 'cancelled') {
    return 'Reativar assinatura';
  }

  if (assinatura.status === 'free') {
    return 'Ver planos';
  }

  return 'Ver planos';
}

export function resolveBillingTrialPhase(
  assinatura?: ResponseIgrejaAssinaturaDto | null,
): BillingTrialPhase {
  if (!assinatura) return 'none';

  if (assinatura.status === 'expired') {
    return 'expired';
  }

  if (assinatura.status !== 'trial') {
    return 'none';
  }

  const daysRemaining = Number(assinatura.daysRemainingInTrial ?? 0);

  if (daysRemaining <= 0) {
    return 'expired';
  }

  if (daysRemaining <= 2) {
    return 'ending';
  }

  if (daysRemaining <= 7) {
    return 'warning';
  }

  return 'early';
}

export function shouldShowBillingNoticeBanner(assinatura?: ResponseIgrejaAssinaturaDto | null) {
  if (!assinatura) return false;

  return (
    assinatura.status === 'trial' ||
    assinatura.status === 'expired' ||
    assinatura.status === 'overdue' ||
    hasPendingCheckout(assinatura) ||
    hasExceededPlanCapacity(assinatura) ||
    isSubscriptionWriteBlocked(assinatura)
  );
}

function formatDayCount(daysRemaining: number) {
  return `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`;
}

export function resolveBillingNoticeContent(
  assinatura: ResponseIgrejaAssinaturaDto,
): BillingNoticeContent {
  const daysRemaining = Math.max(Number(assinatura.daysRemainingInTrial ?? 0), 0);
  const trialPhase = resolveBillingTrialPhase(assinatura);
  const ctaLabel = resolveBillingPrimaryActionLabel(assinatura);
  const pendingCheckout = hasPendingCheckout(assinatura);
  const exceededCapacity = hasExceededPlanCapacity(assinatura);

  if (assinatura.status === 'expired') {
    return {
      eyebrow: 'Avaliação encerrada',
      title: 'Seu período avaliativo terminou',
      body: 'Assine um plano para continuar usando todos os recursos sem interromper a operação da igreja.',
      ctaLabel,
      tone: 'critical',
    };
  }

  if (assinatura.status === 'overdue') {
    return {
      eyebrow: 'Pagamento em atraso',
      title: 'Sua cobrança está pendente',
      body: assinatura.inGracePeriod
        ? 'Regularize o pagamento para manter o acesso completo antes que a operação da igreja seja interrompida.'
        : 'O pagamento não foi confirmado. Retome agora para reativar todos os recursos da igreja.',
      ctaLabel,
      tone: 'critical',
    };
  }

  if (pendingCheckout) {
    return {
      eyebrow: 'Pagamento pendente',
      title: 'Sua assinatura já pode ser concluída',
      body:
        assinatura.status === 'trial'
          ? 'Retome o pagamento para manter a operação ativa quando a avaliação terminar.'
          : 'Retome o checkout para concluir a assinatura sem precisar reiniciar o processo.',
      ctaLabel,
      tone: trialPhase === 'ending' ? 'warning' : 'info',
    };
  }

  if (exceededCapacity) {
    return {
      eyebrow: 'Capacidade excedida',
      title: 'Seu uso atual já ultrapassa o plano contratado',
      body:
        assinatura.status === 'trial'
          ? 'Atualize o plano agora para seguir testando já na faixa mais adequada ao volume da igreja.'
          : 'Atualize o plano para manter a operação da igreja dentro da capacidade ideal.',
      ctaLabel,
      tone: 'warning',
    };
  }

  if (assinatura.status === 'cancelled') {
    return {
      eyebrow: 'Assinatura cancelada',
      title: 'Sua assinatura foi encerrada',
      body: 'Reative sua assinatura para continuar usando todos os recursos da igreja.',
      ctaLabel,
      tone: 'critical',
    };
  }

  if (trialPhase === 'expired') {
    return {
      eyebrow: 'Avaliação encerrada',
      title: 'Seu período avaliativo terminou',
      body: 'Assine um plano para continuar usando todos os recursos sem interromper a operação da igreja.',
      ctaLabel,
      tone: 'critical',
    };
  }

  if (trialPhase === 'ending') {
    return {
      eyebrow: 'Versão avaliativa',
      title: `${formatDayCount(daysRemaining)} restantes`,
      body: 'Seu acesso avaliativo está perto do fim. Assine agora para manter a operação ativa sem interrupções.',
      ctaLabel,
      tone: 'critical',
    };
  }

  if (trialPhase === 'warning') {
    return {
      eyebrow: 'Versão avaliativa',
      title: `${formatDayCount(daysRemaining)} restantes`,
      body: 'Escolha um plano para continuar usando o app sem interromper a rotina da igreja.',
      ctaLabel,
      tone: 'warning',
    };
  }

  return {
    eyebrow: 'Versão avaliativa',
    title: `${formatDayCount(daysRemaining)} restantes`,
    body: 'Você está usando o app com acesso completo. Explore a operação da igreja e assine quando fizer sentido.',
    ctaLabel,
    tone: 'info',
  };
}
