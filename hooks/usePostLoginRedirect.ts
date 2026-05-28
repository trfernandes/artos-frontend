import { useEffect, useRef } from 'react';
import { router, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';

// Nota: o redirect para convite pendente (pendingInvite / pendingInviteToken)
// agora é tratado em (auth)/_layout.tsx, antes de o usuário chegar aqui.
// Este hook lida apenas com o redirect para /join-church quando o usuário
// está em (app) sem nenhuma igreja vinculada.

export function usePostLoginRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const isRedirectingRef = useRef(false);
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = '/' + segments.join('/');
    const isOnJoinChurchRoute = currentPath.includes('/join-church');
    const isOnInviteRoute = currentPath.includes('/invite');
    const isOnBypassRoute = isOnJoinChurchRoute || isOnInviteRoute;

    const replaceOnce = (target: string, onRedirect?: () => void) => {
      if (isRedirectingRef.current) return;
      if (lastRedirectRef.current === target) return;

      isRedirectingRef.current = true;
      lastRedirectRef.current = target;
      onRedirect?.();
      router.replace(target);
    };

    if (loading) return;

    if (!user) {
      isRedirectingRef.current = false;
      lastRedirectRef.current = null;
      return;
    }

    if (isOnBypassRoute) {
      isRedirectingRef.current = false;
      if (isOnJoinChurchRoute && lastRedirectRef.current === '/(app)/join-church') {
        lastRedirectRef.current = null;
      }
      return;
    }

    if (!user.igrejas || user.igrejas.length === 0) {
      replaceOnce('/(app)/join-church', () => {
        Toast.show({
          type: 'info',
          text1: 'Vincule-se a uma igreja',
          text2: 'Use um código de convite para começar.',
        });
      });
      return;
    }

    isRedirectingRef.current = false;
    lastRedirectRef.current = null;
  }, [loading, user, segments]);
}
