import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import { useLoading } from '../contexts/LoadingContext';
import { CriarCheckoutAssinaturaDto } from '../domain/dtos/Igreja/criar-checkout-assinatura.dto';
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

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const refreshAfterCheckoutReturn = async () => {
    if (!igrejaId) return;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const assinatura = await IgrejaRepository.getAssinatura(igrejaId);
      queryClient.setQueryData(queryKey, assinatura);

      const hasPendingCheckout =
        Boolean(assinatura.checkoutUrl) && assinatura.status !== 'cancelled';
      const shouldStop =
        assinatura.status === 'active' || assinatura.status === 'cancelled' || !hasPendingCheckout;

      if (shouldStop) {
        return;
      }

      await wait(1500);
    }

    await queryClient.invalidateQueries({ queryKey });
  };

  const checkoutMutation = useMutation({
    mutationFn: async (dto: CriarCheckoutAssinaturaDto) => {
      return await IgrejaRepository.criarCheckoutAssinatura(dto);
    },
    onMutate: (dto: CriarCheckoutAssinaturaDto) =>
      showLoading(dto.changePlan ? 'Trocando de plano...' : 'Preparando pagamento...'),
    onSettled: () => hideLoading(),
    onSuccess: async (response) => {
      if (!response.checkoutUrl) {
        throw new Error('checkoutUrl ausente');
      }

      await WebBrowser.openBrowserAsync(response.checkoutUrl);
      await queryClient.invalidateQueries({ queryKey });
      void refreshAfterCheckoutReturn();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Não foi possível iniciar o pagamento agora.';
      FancyAlert.alert('Falha ao abrir pagamento', message);
      Toast.show({
        type: 'error',
        text1: 'Falha ao abrir pagamento',
        text2: message,
      });
    },
  });

  const resumeCheckoutMutation = useMutation({
    mutationFn: async (checkoutUrl: string) => {
      if (!checkoutUrl) throw new Error('checkoutUrl ausente');
      return checkoutUrl;
    },
    onMutate: () => showLoading('Abrindo pagamento...'),
    onSettled: () => hideLoading(),
    onSuccess: async (checkoutUrl) => {
      await WebBrowser.openBrowserAsync(checkoutUrl);
      await queryClient.invalidateQueries({ queryKey });
      void refreshAfterCheckoutReturn();
    },
    onError: (error: any) => {
      const message = error?.message || 'Não foi possível retomar o pagamento agora.';
      FancyAlert.alert('Falha ao abrir pagamento', message);
      Toast.show({
        type: 'error',
        text1: 'Falha ao abrir pagamento',
        text2: message,
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!igrejaId) throw new Error('igrejaId ausente');
      return await IgrejaRepository.cancelarAssinatura(igrejaId);
    },
    onMutate: () => showLoading('Cancelando assinatura...'),
    onSettled: () => hideLoading(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      Toast.show({
        type: 'success',
        text1: 'Assinatura cancelada',
        text2: 'O acesso fica liberado até o fim do período já pago.',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Não foi possível cancelar a assinatura agora.';
      Toast.show({
        type: 'error',
        text1: 'Falha ao cancelar',
        text2: message,
      });
    },
  });

  return {
    ...query,
    iniciarCheckout: checkoutMutation.mutate,
    retomarCheckout: resumeCheckoutMutation.mutate,
    cancelarAssinatura: cancelMutation.mutate,
    isAbrindoCheckout: checkoutMutation.isPending || resumeCheckoutMutation.isPending,
    isCancelandoAssinatura: cancelMutation.isPending,
  };
}
