import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
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
      if (!igrejaId) throw new Error('igrejaId ausente');
      return await IgrejaRepository.criarCheckoutAssinatura(igrejaId, dto);
    },
    onMutate: () => showLoading('Preparando pagamento...'),
    onSettled: () => hideLoading(),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['igreja-assinatura', igrejaId] });

      if (!response.initPointUrl) {
        Toast.show({
          type: 'success',
          text1: 'Plano atualizado',
          text2: 'A assinatura foi atualizada sem precisar abrir checkout.',
        });
        return;
      }

      await Linking.openURL(response.initPointUrl);
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

  return {
    ...query,
    iniciarCheckout: checkoutMutation.mutate,
    isAbrindoCheckout: checkoutMutation.isPending,
  };
}
