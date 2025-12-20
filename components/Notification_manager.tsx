// no topo do _layout.tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { NotificacaoTipoEnum } from '../domain/models/Notificacao';

export function NotificationsManager() {
  useEffect(() => {
    const subRec = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Recebida:', notification.request.content);
    });

    const subClick = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      console.log('[Notifications] Clicada, data:', data);

      switch (data.tipo) {
        case NotificacaoTipoEnum.TesteLocal:
          console.log('[Notifications] Notificação de teste local clicada.');
          break;
        case NotificacaoTipoEnum.EscalaLembrete:
          // navegar para tela de escalas
          router.push('/(app)/(drawer)/escalas');
          break;

        default:
          break;
      }
    });

    return () => {
      subRec.remove();
      subClick.remove();
    };
  }, []);

  return null;
}
