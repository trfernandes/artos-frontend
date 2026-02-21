const MAX_PENDING_AGE_MS = 10 * 60 * 1000; // 10 minutos

type PendingLoginAttempt = {
  email: string;
  senha: string;
  createdAt: number;
};

let pendingLoginAttempt: PendingLoginAttempt | null = null;

export function setPendingLoginAttempt(email: string, senha: string): void {
  pendingLoginAttempt = {
    email: email.trim().toLowerCase(),
    senha,
    createdAt: Date.now(),
  };
}

export function getPendingLoginAttempt(email?: string): PendingLoginAttempt | null {
  if (!pendingLoginAttempt) return null;

  const isExpired = Date.now() - pendingLoginAttempt.createdAt > MAX_PENDING_AGE_MS;
  if (isExpired) {
    pendingLoginAttempt = null;
    return null;
  }

  if (email && pendingLoginAttempt.email !== email.trim().toLowerCase()) {
    return null;
  }

  return pendingLoginAttempt;
}

export function clearPendingLoginAttempt(): void {
  pendingLoginAttempt = null;
}
