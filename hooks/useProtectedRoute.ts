// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';

const PUBLIC_ROUTES = ['/login', '/create-account', '/forgot-password', '/reset-password'];

function isPublic(pathname: string) {
  // cobre /reset-password e /reset-password?token=...
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}?`));
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
    if (user && onPublic) {
      if (pathname !== '/(app)') router.replace('/(app)');
      return;
    }

    // 4) caso normal: não faz nada
  }, [user, loading, pathname, navState?.key, router]);
}
