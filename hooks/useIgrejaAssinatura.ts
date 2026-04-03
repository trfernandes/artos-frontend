import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import { useLoading } from '../contexts/LoadingContext';
import { CriarCheckoutAssinaturaDto } from '../domain/dtos/Igreja/criar-checkout-assinatura.dto';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';

type UseIgrejaAssinaturaOptions = {
  igrejaId?: string;
  autoFetch?: boolean;
};

export function useIgrejaAssinatura({
  igrejaId,
  autoFetch = true,
}: UseIgrejaAssinaturaOptions) {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();

  const query = useQuery({
    queryKey: ['igreja-assinatura', igrejaId],
    enabled: !!igrejaId && autoFetch,
    queryFn: async () => {
      if (!igrejaId) throw new Error('igrejaId ausente');
      return await IgrejaRepository.getAssinatura(igrejaId);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (dto: CriarCheckoutAssinaturaDto) => {
      return await IgrejaRepository.criarCheckoutAssinatura(dto);
    },
    onMutate: () => showLoading('Preparando pagamento...'),
    onSettled: () => hideLoading(),
    onSuccess: async (response) => {
      if (!response.checkoutUrl) {
        throw new Error('checkoutUrl ausente');
      }

      await WebBrowser.openBrowserAsync(response.checkoutUrl);
      await queryClient.invalidateQueries({ queryKey: ['igreja-assinatura', igrejaId] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Não foi possível iniciar o pagamento agora.';
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
      await queryClient.invalidateQueries({ queryKey: ['igreja-assinatura', igrejaId] });
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
    cancelarAssinatura: cancelMutation.mutate,
    isAbrindoCheckout: checkoutMutation.isPending,
    isCancelandoAssinatura: cancelMutation.isPending,
  };
}
