import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';
import { useLoading } from '../contexts/LoadingContext';
import { UpdateIgrejaDadosDto } from '../domain/dtos/Igreja/update-igreja-dados.dto';
import { UpdateIgrejaModoEntradaDto } from '../domain/dtos/Igreja/update-igreja-modo-entrada.dto';
import { UpdateIgrejaNotificacoesDto } from '../domain/dtos/Igreja/update-igreja-notificacoes.dto';
import { ResponseIgrejaConfiguracoesDto } from '../domain/dtos/Igreja/response-igreja-configuracoes.dto';

export type UseIgrejaConfiguracoesOptions = {
  igrejaId: string;
  onUpdateDadosSuccess?: (data: ResponseIgrejaConfiguracoesDto) => void;
  onUpdateDadosError?: (error: any) => void;
  muteMessages?: boolean;
};

export function useIgrejaConfiguracoes({
  igrejaId,
  onUpdateDadosSuccess,
  onUpdateDadosError,
  muteMessages = false,
}: UseIgrejaConfiguracoesOptions) {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();

  // Query para buscar configurações
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['igreja-configuracoes', igrejaId],
    queryFn: async () => {
      const result = await IgrejaRepository.getConfiguracoes(igrejaId);
      if (__DEV__) {
        console.log('[IgrejaConfiguracoes] Dados carregados');
      }
      return result;
    },
    enabled: !!igrejaId,
  });

  // Mutation para atualizar dados cadastrais
  const updateDadosMutation = useMutation<
    ResponseIgrejaConfiguracoesDto,
    Error,
    { igrejaId: string; dto: UpdateIgrejaDadosDto }
  >({
    mutationFn: ({ igrejaId, dto }) => {
      if (__DEV__) {
        console.log('[IgrejaConfiguracoes] Atualizando dados');
      }
      return IgrejaRepository.updateDados(igrejaId, dto);
    },
    onMutate: () => {
      showLoading('Salvando dados...');
    },
    onSuccess: (data) => {
      if (__DEV__) {
        console.log('[IgrejaConfiguracoes] Dados atualizados com sucesso');
      }
      hideLoading();
      queryClient.invalidateQueries({ queryKey: ['igreja-configuracoes', igrejaId] });
      if (!muteMessages) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Dados atualizados com sucesso',
        });
      }
      onUpdateDadosSuccess?.(data);
    },
    onError: (error: any) => {
      hideLoading();
      if (!muteMessages) {
        const message = error?.response?.data?.message || 'Erro ao salvar dados. Tente novamente.';
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: message,
        });
      }
      onUpdateDadosError?.(error);
    },
  });

  // Mutation para atualizar modo de entrada
  const updateModoEntradaMutation = useMutation<
    ResponseIgrejaConfiguracoesDto,
    Error,
    { igrejaId: string; dto: UpdateIgrejaModoEntradaDto }
  >({
    mutationFn: ({ igrejaId, dto }) => IgrejaRepository.updateModoEntrada(igrejaId, dto),
    onMutate: () => {
      showLoading('Atualizando modo de entrada...');
    },
    onSuccess: () => {
      hideLoading();
      queryClient.invalidateQueries({ queryKey: ['igreja-configuracoes', igrejaId] });
      if (!muteMessages) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Modo de entrada atualizado com sucesso',
        });
      }
    },
    onError: (error: any) => {
      hideLoading();
      if (!muteMessages) {
        const message =
          error?.response?.data?.message || 'Erro ao atualizar modo de entrada. Tente novamente.';
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: message,
        });
      }
    },
  });

  // Mutation para atualizar notificações
  const updateNotificacoesMutation = useMutation<
    ResponseIgrejaConfiguracoesDto,
    Error,
    { igrejaId: string; dto: UpdateIgrejaNotificacoesDto }
  >({
    mutationFn: ({ igrejaId, dto }) => IgrejaRepository.updateNotificacoes(igrejaId, dto),
    onMutate: () => {
      showLoading('Atualizando notificações...');
    },
    onSuccess: () => {
      hideLoading();
      queryClient.invalidateQueries({ queryKey: ['igreja-configuracoes', igrejaId] });
      if (!muteMessages) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Notificações atualizadas com sucesso',
        });
      }
    },
    onError: (error: any) => {
      hideLoading();
      if (!muteMessages) {
        const message =
          error?.response?.data?.message || 'Erro ao atualizar notificações. Tente novamente.';
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: message,
        });
      }
    },
  });

  return {
    // Query data
    data,
    isLoading,
    error,
    refetch,

    // Mutations
    updateDados: updateDadosMutation.mutate,
    updateModoEntrada: updateModoEntradaMutation.mutate,
    updateNotificacoes: updateNotificacoesMutation.mutate,

    // Mutation states
    isUpdatingDados: updateDadosMutation.isPending,
    isUpdatingModoEntrada: updateModoEntradaMutation.isPending,
    isUpdatingNotificacoes: updateNotificacoesMutation.isPending,
    isUpdating:
      updateDadosMutation.isPending ||
      updateModoEntradaMutation.isPending ||
      updateNotificacoesMutation.isPending,
  };
}
