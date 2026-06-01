import { ResponseLoginDto } from '../../domain/dtos/login/login.response';

// Canal de módulo entre a tela de "aguardando confirmação" da igreja e a tela
// de boas-vindas. A confirmação retorna os dados de auth completos (token +
// user + igrejas), mas o login (signInWithData) só é efetivado quando o usuário
// toca em "Entrar no app" na welcome — por isso o authData precisa atravessar a
// navegação. Mesmo padrão do pendingLoginAttemptStore (variável de módulo + TTL).
const MAX_PENDING_AGE_MS = 10 * 60 * 1000; // 10 minutos

type PendingWelcome = {
  authData: ResponseLoginDto;
  createdAt: number;
};

let pendingWelcome: PendingWelcome | null = null;

export function setPendingWelcomeAuth(authData: ResponseLoginDto): void {
  pendingWelcome = { authData, createdAt: Date.now() };
}

export function getPendingWelcomeAuth(): ResponseLoginDto | null {
  if (!pendingWelcome) return null;

  const isExpired = Date.now() - pendingWelcome.createdAt > MAX_PENDING_AGE_MS;
  if (isExpired) {
    pendingWelcome = null;
    return null;
  }

  return pendingWelcome.authData;
}

export function clearPendingWelcomeAuth(): void {
  pendingWelcome = null;
}
