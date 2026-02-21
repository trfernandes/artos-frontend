import { useEffect, useRef } from 'react';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';

const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

export function usePostLoginRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const hasCheckedRef = useRef(false);
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

    const checkAndRedirect = async () => {
      if (loading) return;

      if (!user) {
        hasCheckedRef.current = false;
        isRedirectingRef.current = false;
        lastRedirectRef.current = null;
        return;
      }

      if (isOnBypassRoute) {
        isRedirectingRef.current = false;

        if (isOnJoinChurchRoute && lastRedirectRef.current === '/(app)/join-church') {
          lastRedirectRef.current = null;
        }

        if (isOnInviteRoute && lastRedirectRef.current?.startsWith('/(public)/invite/')) {
          lastRedirectRef.current = null;
        }

        return;
      }

      // Verifica token pendente apenas uma vez por sessão autenticada.
      if (!hasCheckedRef.current) {
        try {
          const pendingToken = await AsyncStorage.getItem(PENDING_INVITE_TOKEN_KEY);
          if (pendingToken) {
            await AsyncStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
            replaceOnce(`/(public)/invite/${pendingToken}`, () => {
              Toast.show({
                type: 'info',
                text1: 'Processando convite...',
              });
            });
            hasCheckedRef.current = true;
            return;
          }
        } catch (err) {
          console.error('Erro ao verificar token pendente:', err);
        } finally {
          hasCheckedRef.current = true;
        }
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
    };

    void checkAndRedirect();
  }, [loading, user, segments]);
}
