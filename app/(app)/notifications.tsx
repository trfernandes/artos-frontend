import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../components/containers/FancyPageView';
import { ThemePalette } from '../../constants/colors';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import FancyTabs, { TabItem } from '../../components/tabs/FancyTabs';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import NotificationsList from '../../components/pages/notifications/NotificationsList';
import FancyLoading from '../../components/FancyLoading';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ResponseNotificacaoDto } from '../../domain/dtos/Notificacao/notificacao.response';
import { emitNotificationEvent } from '../../core/events/notification-events';

export default function NotificationsPage() {
  const styles = useThemedStyles(createStyles);
  const [dismissedUnreadCount, setDismissedUnreadCount] = useState<number | null>(null);

  const {
    isLoading,
    marcarComoLida,
    marcarTodasComoLidas,
    notificacoes,
    refetchNotificacoes,
    refetchQuantidadeNaoLidas,
  } = useNotificacoesCrud({
    enabled: true,
  });

  const naoLidasData = useMemo(
    () => notificacoes?.filter((n) => !n.lidaEm || n.lidaEm === null) ?? [],
    [notificacoes],
  );
  const unreadCount = naoLidasData.length;
  const totalCount = notificacoes?.length ?? 0;
  const shouldShowUnreadBanner = unreadCount > 0 && dismissedUnreadCount !== unreadCount;

  const handleMarcarTodasComoLidas = useCallback(() => {
    setDismissedUnreadCount(unreadCount);
    void marcarTodasComoLidas();
  }, [marcarTodasComoLidas, unreadCount]);

  const handleOpenNotification = useCallback(
    (notification: ResponseNotificacaoDto) => {
      if (!notification.lidaEm) {
        void marcarComoLida(notification.id);
      }
      router.push({
        pathname: '/(app)/notification-detail' as any,
        params: {
          notification: JSON.stringify(notification),
        },
      });
      emitNotificationEvent('notification_opened', {
        payload: notification,
        source: 'inbox',
      });
    },
    [marcarComoLida],
  );

  const handleMarkAsRead = useCallback(
    (notification: ResponseNotificacaoDto) => {
      if (!notification.lidaEm) {
        void marcarComoLida(notification.id);
      }
    },
    [marcarComoLida],
  );

  useFocusEffect(
    useCallback(() => {
      void refetchNotificacoes();
      void refetchQuantidadeNaoLidas();
    }, [refetchNotificacoes, refetchQuantidadeNaoLidas]),
  );

  const TAB_ITEMS: TabItem[] = [
    {
      title: 'Não lidas',
      badgeCount: unreadCount,
      icon: { library: 'MaterialCommunityIcons', name: 'email-outline', size: 14 },
      content: (
        <View style={{ flex: 1 }}>
          <NotificationsList
            dataList={naoLidasData}
            onPress={handleOpenNotification}
            onMarkAsRead={handleMarkAsRead}
            sectionHeaderAction={
              shouldShowUnreadBanner
                ? {
                    label: 'Marcar todas como lidas',
                    onPress: handleMarcarTodasComoLidas,
                  }
                : undefined
            }
            listEmptyLabel='Você está em dia!'
            listEmptyHelper='Nenhuma notificação não lida.'
          />
        </View>
      ),
    },
    {
      title: 'Todas',
      badgeCount: totalCount,
      icon: { library: 'MaterialCommunityIcons', name: 'bell-outline', size: 14 },
      content: (
        <View style={{ flex: 1 }}>
          <NotificationsList
            dataList={notificacoes}
            onPress={handleOpenNotification}
            onMarkAsRead={handleMarkAsRead}
            listEmptyLabel='Sem notificações por aqui.'
          />
        </View>
      ),
    },
  ];

  if (isLoading) return <FancyLoading />;
  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={TAB_ITEMS} />
    </FancyPageView>
  );
}

function createStyles(_Pallete: ThemePalette) {
  return StyleSheet.create({
    container: { gap: 15 },
  });
}
