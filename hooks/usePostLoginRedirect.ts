import { useEffect, useRef } from 'react';
import { router, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';

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
      // Sem igreja ativa: o destino depende de já existir uma solicitação
      // pendente (ex.: cadastro por convite que exige aprovação). Se houver,
      // mostra o estado "Aguardando aprovação"; senão, pede um código.
      // A flag é marcada já aqui para evitar dois redirects enquanto o fetch
      // assíncrono resolve.
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;

      void (async () => {
        let temPendente = false;
        try {
          const solicitacoes = await IgrejaRepository.listarMinhasSolicitacoes();
          temPendente = solicitacoes.some((s) => s.status === 'PENDING');
        } catch {
          // Em caso de falha, cai no fluxo padrão (inserir código).
          temPendente = false;
        }

        // Libera a flag para o replaceOnce abaixo poder navegar uma única vez.
        isRedirectingRef.current = false;

        if (temPendente) {
          replaceOnce('/(app)/join-church/requests');
        } else {
          replaceOnce('/(app)/join-church', () => {
            Toast.show({
              type: 'info',
              text1: 'Vincule-se a uma igreja',
              text2: 'Use um código de convite para começar.',
            });
          });
        }
      })();
      return;
    }

    isRedirectingRef.current = false;
    lastRedirectRef.current = null;
  }, [loading, user, segments]);
}
