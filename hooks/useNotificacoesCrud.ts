import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificacoesApi } from '../domain/api/NotificacoesApi';

export function useNotificacoesCrud({
  apenasNaoLidas = false,
  enabled = true,
}: {
  apenasNaoLidas?: boolean;
  enabled?: boolean;
} = {}) {
  const qc = useQueryClient();

  const listarQuery = useQuery({
    queryKey: ['notificacoes', apenasNaoLidas],
    queryFn: () => NotificacoesApi.listar(apenasNaoLidas),
    enabled,
  });

  const contarNaoLidasQuery = useQuery({
    queryKey: ['notificacoes', 'unread-count'],
    queryFn: async () => NotificacoesApi.contarNaoLidas(),
    enabled,
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

  const noop = () => {};
  const noopMarcarComoLida = (_id: string) => {};

  return {
    notificacoes: enabled ? listarQuery.data ?? [] : [],
    isLoading: enabled ? listarQuery.isLoading : false,
    isLoadingMutation: enabled ? marcarComoLidoMutation.isPending || marcarTodasComoLidasMutation.isPending : false,
    quantidadeNaoLidas: enabled ? contarNaoLidasQuery.data ?? 0 : 0,
    marcarComoLida: enabled ? (id: string) => marcarComoLidoMutation.mutate(id) : noopMarcarComoLida,
    marcarTodasComoLidas: enabled ? () => marcarTodasComoLidasMutation.mutate() : noop,
  };
}
