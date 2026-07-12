import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLoading } from '../contexts/LoadingContext';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';
import { FancyAlert } from '../components/modal/FancyAlert';

type UseIgrejaAssinaturaOptions = {
  igrejaId?: string;
  autoFetch?: boolean;
};

export function useIgrejaAssinatura({ igrejaId, autoFetch = true }: UseIgrejaAssinaturaOptions) {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();
  const queryKey = ['igreja-assinatura', igrejaId] as const;

  const query = useQuery({
    queryKey,
    enabled: !!igrejaId && autoFetch,
    queryFn: async () => {
      if (!igrejaId) throw new Error('igrejaId ausente');
      return await IgrejaRepository.getAssinatura(igrejaId);
    },
  });

  // Único ponto de abertura do portal web de assinatura (diakonia.app.br/assinar) —
  // consumido por todo ponto de contato de billing no app. Sempre navegador do
  // sistema via Linking, nunca WebView (checkout tem que sair do app).
  const abrirPortalMutation = useMutation({
    mutationFn: async () => {
      if (!igrejaId) throw new Error('igrejaId ausente');
      const { url } = await IgrejaRepository.solicitarPortalAssinatura(igrejaId);
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('Não foi possível abrir o navegador.');
      await Linking.openURL(url);
    },
    onMutate: () => showLoading('Abrindo portal de assinatura...'),
    onSettled: () => hideLoading(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível abrir o portal de assinatura agora.';
      FancyAlert.alert('Falha ao abrir portal', message);
      Toast.show({
        type: 'error',
        text1: 'Falha ao abrir portal',
        text2: message,
      });
    },
  });

  return {
    ...query,
    abrirPortalDeAssinatura: abrirPortalMutation.mutate,
    isAbrindoPortal: abrirPortalMutation.isPending,
  };
}
