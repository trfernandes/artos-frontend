import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { NotificacaoTipoEnum } from '../domain/enums/Notificacao/tipo-notificacao.enum';

function handleNotificationNavigation(data: any) {
  if (!data) return;

  // Se o backend enviar uma rota específica, usá-la diretamente
  if (data.route) {
    const params = data.params || {};
    router.push({ pathname: data.route, params });
    return;
  }

  // Routing baseado no tipo de notificação
  switch (data.tipo) {
    case NotificacaoTipoEnum.TesteLocal:
      console.log('[Notifications] Notificação de teste local clicada.');
      break;

    case NotificacaoTipoEnum.EscalaLembrete:
      router.push('/(app)/(drawer)/pessoal/escalas');
      break;

    case NotificacaoTipoEnum.IgrejaVinculoSolicitado:
      router.push('/(app)/(drawer)/admin/solicitacoes');
      break;

    case NotificacaoTipoEnum.IgrejaConviteAceito:
    case NotificacaoTipoEnum.IgrejaVinculoAprovado:
    case NotificacaoTipoEnum.IgrejaVinculoNegado:
      router.push('/(app)/notifications');
      break;

    default:
      router.push('/(app)/notifications');
      break;
  }
}

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
        setTimeout(() => handleNotificationNavigation(data), 500);
      }
    };
    handleLastNotification();

    // Notificação recebida em foreground
    const subRec = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Recebida:', notification.request.content);
    });

    // Notificação clicada (foreground ou background)
    const subClick = Notifications.addNotificationResponseReceivedListener((response) => {
      lastResponseHandled.current = true;
      const data = response.notification.request.content.data as any;
      console.log('[Notifications] Clicada, data:', data);
      handleNotificationNavigation(data);
    });

    return () => {
      subRec.remove();
      subClick.remove();
    };
  }, []);

  return null;
}
