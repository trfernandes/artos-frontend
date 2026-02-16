// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import apiClient from '../domain/api/api-client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificacaoTipoEnum } from '../domain/enums/Notificacao/tipo-notificacao.enum';

const PUSH_TOKEN_STORAGE_KEY = 'artos_push_token';

// Handler global: como a notificação se comporta em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(voluntarioId: string): Promise<string | null> {
  // 1) Não tenta registrar push em emulador
  if (!Device.isDevice) {
    console.log('[Notifications] Emulador: não vou tentar registrar push token.');
    return null;
  }

  // 2) Permissões
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permissão negada.');
    return null;
  }

  // 3) Obter token com try/catch
  let expoPushToken: string | null = null;

  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    expoPushToken = data;
    console.log('[Notifications] Expo push token:', expoPushToken);
  } catch (error: any) {
    console.log('[Notifications] Erro ao obter Expo push token:', error);
    // Aqui cai o E_REGISTRATION_FAILED em emulador ou ambiente sem suporte
    return null; // não trava o app, só segue sem token
  }

  if (!expoPushToken) {
    return null;
  }

  // 4) Canal Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // 5) Verificar se o token mudou desde o último registro
  const previousToken = await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY);
  if (previousToken === expoPushToken) {
    console.log('[Notifications] Token não mudou, pular re-registro.');
    return expoPushToken;
  }

  // 6) Enviar token para API
  try {
    await apiClient.post(`/notificacoes/device-tokens/${voluntarioId}`, {
      expoPushToken,
      plataforma: Platform.OS,
      previousToken: previousToken || undefined,
    });
    await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, expoPushToken);
    console.log('[Notifications] Token registrado com sucesso.');
  } catch (error) {
    console.log('[Notifications] Erro ao enviar token para API:', error);
  }

  return expoPushToken;
}

export async function deregisterPushToken(): Promise<void> {
  try {
    const storedToken = await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY);
    if (storedToken) {
      await apiClient.delete('/notificacoes/device-tokens', {
        data: { expoPushToken: storedToken },
      });
      await SecureStore.deleteItemAsync(PUSH_TOKEN_STORAGE_KEY);
      console.log('[Notifications] Token removido com sucesso.');
    }
  } catch (error) {
    console.log('[Notifications] Erro ao remover token:', error);
  }
}

// Utilitário só para debug no emulador / aparelho
export async function scheduleLocalTestNotification() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') {
      console.log('[Notifications] Sem permissão para local notification.');
      return;
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Teste Artos',
      body: 'Notificação local de teste.',
      data: { tipo: NotificacaoTipoEnum.TesteLocal },
    },
    trigger: null, // dispara imediatamente
  });

  console.log('[Notifications] Local notification agendada, id:', id);
}

export async function scheduleLocalEscalaNotification(name: string, date: Date) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') {
      console.log('[Notifications] Sem permissão para local notification.');
      return;
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Lembrete de escala`,
      body: `Você está escalado para o evento '${name}' no ${format(date, "EEEE dd 'de' MMMM 'às' HH:mm'h'", { locale: ptBR })}.`,
      data: { tipo: NotificacaoTipoEnum.EscalaLembrete },
    },
    trigger: null, // dispara imediatamente
  });

  console.log('[Notifications] Local notification agendada, id:', id);
}
