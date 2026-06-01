// hooks/useProtectedRoute.ts
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';

const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/create-account',
  '/admin-discovery',
  '/create-igreja-account',
  '/create-voluntario-account',
  '/forgot-password',
  '/reset-password',
  '/igreja-cadastro-aguardando-email',
  '/voluntario-aguardando-email',
  '/welcome',
  '/invite/',
];

const PENDING_INVITE_KEY = 'pendingInvite';
const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken'; // legado

function isInviteRoute(pathname: string) {
  return pathname.startsWith('/invite/');
}

function isPublic(pathname: string) {
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

// Apenas LÊ o token (não deleta). A limpeza é feita pela própria tela de
// convite após carregar. Isso garante que login.tsx e useProtectedRoute
// concordem sempre no mesmo destino (sem corrida de quem-deleta-primeiro).
async function peekPendingInviteToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_INVITE_KEY);
    const legacy = await AsyncStorage.getItem(PENDING_INVITE_TOKEN_KEY);
    return raw ? (JSON.parse(raw)?.token ?? null) : (legacy ?? null);
  } catch {
    return null;
  }
}

export function useProtectedRoute() {
  const { user, loading, hasAuthenticatedBefore } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const navState = useRootNavigationState(); // só fica definido quando o Navigator montou
  // Garante que o redirect pós-login dispara apenas uma vez por sessão
  // autenticada (evita re-disparo quando pathname muda durante a transição).
  const postLoginHandledRef = useRef(false);

  useEffect(() => {
    // 1) ainda carregando user OU nav ainda não montou → não decide nada
    if (loading || !navState?.key) return;

    const onPublic = isPublic(pathname);

    // Reset do flag quando deslogado
    if (!user) {
      postLoginHandledRef.current = false;
    }

    // 2) não logado tentando rota privada → manda pro login
    if (!user && !onPublic) {
      const target = hasAuthenticatedBefore ? '/login' : '/create-account';
      if (pathname !== target) router.replace(target);
      return;
    }

    // 3) logado tentando rota pública → checa convite pendente; se houver,
    // vai direto para a tela de convite; senão, manda pra (app).
    if (user && onPublic && !isInviteRoute(pathname)) {
      if (postLoginHandledRef.current) return;
      postLoginHandledRef.current = true;

      void (async () => {
        const inviteToken = await peekPendingInviteToken();
        if (inviteToken) {
          router.replace(`/(public)/invite/${inviteToken}`);
        } else if (pathname !== '/(app)') {
          router.replace('/(app)');
        }
      })();
      return;
    }

    // 4) caso normal: não faz nada
  }, [user, loading, pathname, navState?.key, router, hasAuthenticatedBefore]);
}
