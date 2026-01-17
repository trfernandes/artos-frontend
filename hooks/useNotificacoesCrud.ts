import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificacoesApi } from '../domain/api/NotificacoesApi';

export function useNotificacoesCrud({ apenasNaoLidas = false }: { apenasNaoLidas?: boolean } = {}) {
  const qc = useQueryClient();

  const listarQuery = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => NotificacoesApi.listar(false),
  });

  const contarNaoLidasQuery = useQuery({
    queryKey: ['notificacoes', 'unread-count'],
    queryFn: async () => NotificacoesApi.contarNaoLidas(),
  });

  const marcarComoLidoMutation = useMutation({
    mutationFn: (id: string) => NotificacoesApi.marcarComoLido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificacoes'] });
      qc.invalidateQueries({ queryKey: ['notificacoes', 'unread-count'] });
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: () => NotificacoesApi.marcarTodasComoLidas(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificacoes'] });
      qc.invalidateQueries({ queryKey: ['notificacoes', 'unread-count'] });
    },
  });

  return {
    notificacoes: listarQuery.data ?? [],
    isLoading: listarQuery.isLoading,
    isLoadingMutation: marcarComoLidoMutation.isPending || marcarTodasComoLidasMutation.isPending,
    quantidadeNaoLidas: contarNaoLidasQuery.data ?? 0,
    marcarComoLida: (id: string) => marcarComoLidoMutation.mutate(id),
    marcarTodasComoLidas: () => marcarTodasComoLidasMutation.mutate(),
  };
}
