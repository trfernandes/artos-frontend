import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { NotificacoesApi } from '../domain/api/NotificacoesApi';
import { ResponseNotificacaoDto } from '../domain/dtos/Notificacao/notificacao.response';
import { emitNotificationEvent } from '../core/events/notification-events';
import { useAuth } from '../contexts/AuthContext';

const NOTIFICACOES_QUERY_KEY = ['notificacoes'] as const;
const NOTIFICATIONS_STALE_TIME_MS = 60_000;

type QuerySnapshot = Array<[readonly unknown[], ResponseNotificacaoDto[] | undefined]>;
type MutationContext = {
  previousLists: QuerySnapshot;
  previousUnreadCount?: number;
};

function isUnread(notification: ResponseNotificacaoDto) {
  return !notification.lidaEm;
}

function getNotificationChurchId(notification: ResponseNotificacaoDto): string | null {
  const payload = notification.data;
  if (!payload || typeof payload !== 'object') return null;

  const churchId = typeof payload.churchId === 'string' ? payload.churchId : undefined;
  if (churchId) return churchId;

  const params = payload.params;
  if (params && typeof params === 'object' && typeof params.igrejaId === 'string') {
    return params.igrejaId;
  }

  return null;
}

function filterNotificationsByChurch(notifications: ResponseNotificacaoDto[], igrejaId?: string) {
  if (!igrejaId) return notifications;

  return notifications.filter((notification) => {
    const notificationChurchId = getNotificationChurchId(notification);
    return !notificationChurchId || notificationChurchId === igrejaId;
  });
}

function getFlagFromQueryKey(queryKey: readonly unknown[]) {
  return queryKey[0] === 'notificacoes' && typeof queryKey[1] === 'boolean' ? queryKey[1] : undefined;
}

function updateSingleNotificationOnList(
  list: ResponseNotificacaoDto[],
  id: string,
  readAt: string,
  onlyUnreadList: boolean,
) {
  const updated = list.map((notification) =>
    notification.id === id && !notification.lidaEm
      ? {
          ...notification,
          lidaEm: readAt,
        }
      : notification,
  );

  return onlyUnreadList ? updated.filter(isUnread) : updated;
}

function markAllAsReadOnList(list: ResponseNotificacaoDto[], readAt: string, onlyUnreadList: boolean) {
  if (onlyUnreadList) return [];
  return list.map((notification) =>
    notification.lidaEm
      ? notification
      : {
          ...notification,
          lidaEm: readAt,
        },
  );
}

function getUnreadCountFromSnapshots(snapshots: QuerySnapshot) {
  const allNotificationsSnapshot = snapshots.find(([queryKey]) => getFlagFromQueryKey(queryKey) === false)?.[1];
  if (!allNotificationsSnapshot) return 0;
  return allNotificationsSnapshot.reduce((count, notification) => (isUnread(notification) ? count + 1 : count), 0);
}

export function useNotificacoesCrud({
  apenasNaoLidas = false,
  enabled = true,
  includeList = true,
  includeUnreadCount = true,
}: {
  apenasNaoLidas?: boolean;
  enabled?: boolean;
  includeList?: boolean;
  includeUnreadCount?: boolean;
} = {}) {
  const qc = useQueryClient();
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;
  const unreadCountQueryKey = ['notificacoes', 'unread-count', igrejaId] as const;

  const listarQuery = useQuery({
    queryKey: ['notificacoes', apenasNaoLidas, igrejaId],
    queryFn: async () => filterNotificationsByChurch(await NotificacoesApi.listar(apenasNaoLidas), igrejaId),
    enabled: enabled && includeList,
    staleTime: NOTIFICATIONS_STALE_TIME_MS,
  });

  const contarNaoLidasQuery = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: async () => {
      const notificacoesNaoLidas = await NotificacoesApi.listar(true);
      return filterNotificationsByChurch(notificacoesNaoLidas, igrejaId).length;
    },
    enabled: enabled && includeUnreadCount,
    staleTime: NOTIFICATIONS_STALE_TIME_MS,
  });

  const marcarComoLidoMutation = useMutation<void, unknown, string, MutationContext>({
    mutationFn: (id: string) => NotificacoesApi.marcarComoLido(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICACOES_QUERY_KEY });
      await qc.cancelQueries({ queryKey: ['notificacoes', 'unread-count'] });

      const previousLists = qc.getQueriesData<ResponseNotificacaoDto[]>({
        queryKey: NOTIFICACOES_QUERY_KEY,
      });
      const previousUnreadCount = qc.getQueryData<number>(unreadCountQueryKey);

      const readAt = new Date().toISOString();
      let hadUnreadTarget = false;

      for (const [queryKey, list] of previousLists) {
        if (!Array.isArray(list)) continue;
        const onlyUnreadList = getFlagFromQueryKey(queryKey) === true;

        if (!hadUnreadTarget) {
          hadUnreadTarget = list.some((notification) => notification.id === id && isUnread(notification));
        }

        qc.setQueryData(queryKey, updateSingleNotificationOnList(list, id, readAt, onlyUnreadList));
      }

      if (hadUnreadTarget) {
        const baselineCount = previousUnreadCount ?? getUnreadCountFromSnapshots(previousLists);
        qc.setQueryData(unreadCountQueryKey, Math.max(0, baselineCount - 1));
        emitNotificationEvent('notification_marked_read', { id });
      }

      return { previousLists, previousUnreadCount };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousLists) {
        qc.setQueryData(queryKey, data);
      }
      if (context.previousUnreadCount !== undefined) {
        qc.setQueryData(unreadCountQueryKey, context.previousUnreadCount);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACOES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['notificacoes', 'unread-count'] });
    },
  });

  const marcarTodasComoLidasMutation = useMutation<void, unknown, void, MutationContext>({
    mutationFn: () => NotificacoesApi.marcarTodasComoLidas(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICACOES_QUERY_KEY });
      await qc.cancelQueries({ queryKey: ['notificacoes', 'unread-count'] });

      const previousLists = qc.getQueriesData<ResponseNotificacaoDto[]>({
        queryKey: NOTIFICACOES_QUERY_KEY,
      });
      const previousUnreadCount = qc.getQueryData<number>(unreadCountQueryKey);
      const readAt = new Date().toISOString();

      for (const [queryKey, list] of previousLists) {
        if (!Array.isArray(list)) continue;
        const onlyUnreadList = getFlagFromQueryKey(queryKey) === true;
        qc.setQueryData(queryKey, markAllAsReadOnList(list, readAt, onlyUnreadList));
      }

      qc.setQueryData(unreadCountQueryKey, 0);
      emitNotificationEvent('notifications_marked_all_read', {});

      return { previousLists, previousUnreadCount };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousLists) {
        qc.setQueryData(queryKey, data);
      }
      if (context.previousUnreadCount !== undefined) {
        qc.setQueryData(unreadCountQueryKey, context.previousUnreadCount);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACOES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['notificacoes', 'unread-count'] });
    },
  });

  const noop = async () => {};
  const noopMarcarComoLida = async (_id: string) => {};
  const refetchNotificacoes = useCallback(async () => {
    if (!enabled || !includeList) return;
    await listarQuery.refetch();
  }, [enabled, includeList, listarQuery.refetch]);
  const refetchQuantidadeNaoLidas = useCallback(async () => {
    if (!enabled || !includeUnreadCount) return;
    await contarNaoLidasQuery.refetch();
  }, [enabled, includeUnreadCount, contarNaoLidasQuery.refetch]);

  return {
    notificacoes: enabled ? listarQuery.data ?? [] : [],
    isLoading: enabled && includeList ? listarQuery.isLoading : false,
    isLoadingMutation: enabled ? marcarComoLidoMutation.isPending || marcarTodasComoLidasMutation.isPending : false,
    quantidadeNaoLidas: enabled && includeUnreadCount ? contarNaoLidasQuery.data ?? 0 : 0,
    marcarComoLida: enabled ? (id: string) => marcarComoLidoMutation.mutateAsync(id) : noopMarcarComoLida,
    marcarTodasComoLidas: enabled ? () => marcarTodasComoLidasMutation.mutateAsync() : noop,
    refetchNotificacoes,
    refetchQuantidadeNaoLidas,
  };
}
