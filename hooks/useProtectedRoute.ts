// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';

const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/create-account',
  '/create-igreja-account',
  '/create-voluntario-account',
  '/forgot-password',
  '/reset-password',
  '/igreja-cadastro-aguardando-email',
  '/invite/',
];

function isInviteRoute(pathname: string) {
  return pathname.startsWith('/invite/');
}

function isPublic(pathname: string) {
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const navState = useRootNavigationState(); // só fica definido quando o Navigator montou

  useEffect(() => {
    // 1) ainda carregando user OU nav ainda não montou → não decide nada
    if (loading || !navState?.key) return;

    const onPublic = isPublic(pathname);

    // 2) não logado tentando rota privada → manda pro login
    if (!user && !onPublic) {
      if (pathname !== '/login') router.replace('/login');
      return;
    }

    // 3) logado tentando rota pública → manda pra área logada
    if (user && onPublic && !isInviteRoute(pathname)) {
      if (pathname !== '/(app)') router.replace('/(app)');
      return;
    }

    // 4) caso normal: não faz nada
  }, [user, loading, pathname, navState?.key, router]);
}
