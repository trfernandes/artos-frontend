import { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';

const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

export function usePostLoginRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Aguardar até que a sessão esteja carregada
      if (loading) return;
      
      // Se não estiver logado, resetar check
      if (!user) {
        setHasChecked(false);
        return;
      }
      
      // Se já verificou, não fazer nada
      if (hasChecked) return;

      // Não redirecionar se já estiver nas telas de join-church ou convite
      const currentPath = '/' + segments.join('/');
      if (
        currentPath.includes('/join-church') ||
        currentPath.includes('/invite')
      ) {
        setHasChecked(true);
        return;
      }

      // 1. Verificar se tem token de convite pendente
      try {
        const pendingToken = await AsyncStorage.getItem(PENDING_INVITE_TOKEN_KEY);
        if (pendingToken) {
          await AsyncStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
          Toast.show({
            type: 'info',
            text1: 'Processando convite...',
          });
          setHasChecked(true);
          router.replace(`/(public)/invite/${pendingToken}`);
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar token pendente:', err);
      }

      // 2. Se não tem igrejas, redirecionar para join-church
      if (!user.igrejas || user.igrejas.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'Vincule-se a uma igreja',
          text2: 'Use um código de convite para começar.',
        });
        setHasChecked(true);
        router.replace('/(app)/join-church');
        return;
      }

      setHasChecked(true);
    };

    checkAndRedirect();
  }, [user, loading, segments, hasChecked]);
}
