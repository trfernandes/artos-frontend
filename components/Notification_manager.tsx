import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { emitNotificationEvent } from '../core/events/notification-events';
import { openNotification } from '../services/notification-routing';

export function NotificationsManager() {
  const lastResponseHandled = useRef(false);

  useEffect(() => {
    // Cold-start: app aberto do estado "killed" via toque na notificação
    const handleLastNotification = async () => {
      if (lastResponseHandled.current) return;
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        lastResponseHandled.current = true;
        const data = lastResponse.notification.request.content.data as any;
        console.log('[Notifications] Cold-start notification:', data);
        // Delay para garantir que a navegação esteja pronta
        setTimeout(() => openNotification(data, 'push'), 500);
      }
    };
    handleLastNotification();

    // Notificação recebida em foreground
    const subRec = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Recebida:', notification.request.content);
      const payload = (notification.request.content.data as Record<string, any>) || {};
      emitNotificationEvent('notification_received_foreground', { payload });
    });

    // Notificação clicada (foreground ou background)
    const subClick = Notifications.addNotificationResponseReceivedListener((response) => {
      lastResponseHandled.current = true;
      const data = response.notification.request.content.data as any;
      console.log('[Notifications] Clicada, data:', data);
      openNotification(data, 'push');
    });

    return () => {
      subRec.remove();
      subClick.remove();
    };
  }, []);

  return null;
}
