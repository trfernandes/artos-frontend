// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import apiClient from '../domain/api/api-client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificacaoTipoEnum } from '../domain/enums/Notificacao/tipo-notificacao.enum';

const PUSH_TOKEN_STORAGE_KEY = 'artos_push_token';
const PUSH_DEVICE_ID_STORAGE_KEY = 'artos_push_device_id';
const PUSH_REGISTRATION_METADATA_STORAGE_KEY = 'artos_push_registration_metadata';

type PushRegistrationMetadata = {
  expoPushToken: string;
  voluntarioId: string;
  appVersion: string;
  platform: string;
  deviceId: string;
  registeredAt: string;
};

type RegisterPushOptions = {
  forceRefresh?: boolean;
};

const PUSH_REGISTRATION_REFRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

function toErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const responseMessage = (error as any)?.response?.data?.message;
    if (Array.isArray(responseMessage)) {
      return responseMessage.join(', ');
    }
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }

    const message = (error as any)?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'Falha ao registrar o token push no backend.';
}

function getCurrentAppVersion() {
  return String(Constants.nativeAppVersion || Constants.expoConfig?.version || 'unknown');
}

function getExpoProjectId() {
  const expoProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const easProjectId = Constants.easConfig?.projectId;

  if (typeof easProjectId === 'string' && easProjectId.length > 0) {
    return easProjectId;
  }

  if (typeof expoProjectId === 'string' && expoProjectId.length > 0) {
    return expoProjectId;
  }

  return undefined;
}

function createDeviceId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);
  return `artos-${Platform.OS}-${timestamp}-${random}`;
}

async function getOrCreateDeviceId() {
  const existing = await AsyncStorage.getItem(PUSH_DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;
  const created = createDeviceId();
  await AsyncStorage.setItem(PUSH_DEVICE_ID_STORAGE_KEY, created);
  return created;
}

async function getStoredRegistrationMetadata(): Promise<PushRegistrationMetadata | null> {
  try {
    const raw = await AsyncStorage.getItem(PUSH_REGISTRATION_METADATA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PushRegistrationMetadata | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.expoPushToken || !parsed.voluntarioId || !parsed.deviceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function saveRegistrationMetadata(metadata: PushRegistrationMetadata) {
  await AsyncStorage.setItem(PUSH_REGISTRATION_METADATA_STORAGE_KEY, JSON.stringify(metadata));
}

function shouldRefreshRegistration(
  previousMetadata: PushRegistrationMetadata | null,
  options?: RegisterPushOptions,
) {
  if (options?.forceRefresh) {
    return true;
  }

  if (!previousMetadata?.registeredAt) {
    return true;
  }

  const registeredAt = Date.parse(previousMetadata.registeredAt);
  if (Number.isNaN(registeredAt)) {
    return true;
  }

  return Date.now() - registeredAt >= PUSH_REGISTRATION_REFRESH_WINDOW_MS;
}

// Handler global: como a notificação se comporta em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(
  voluntarioId: string,
  options?: RegisterPushOptions,
): Promise<string | null> {
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
    const projectId = getExpoProjectId();
    const { data } = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
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

  // 5) Regras de re-registro inteligente
  const previousToken = await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY);
  const previousMetadata = await getStoredRegistrationMetadata();
  const deviceId = await getOrCreateDeviceId();
  const appVersion = getCurrentAppVersion();
  const shouldRefresh = shouldRefreshRegistration(previousMetadata, options);

  const shouldRegister =
    !previousMetadata ||
    previousMetadata.expoPushToken !== expoPushToken ||
    previousMetadata.voluntarioId !== voluntarioId ||
    previousMetadata.appVersion !== appVersion ||
    previousMetadata.deviceId !== deviceId ||
    shouldRefresh;

  if (!shouldRegister && previousToken === expoPushToken) {
    console.log('[Notifications] Registro de push em dia, sem re-registro.');
    return expoPushToken;
  }

  // 6) Enviar token para API
  try {
    await apiClient.post('/me/push-tokens', {
      expoPushToken,
      plataform: Platform.OS,
      previousToken: previousMetadata?.expoPushToken || previousToken || undefined,
      deviceId,
      appVersion,
    });
    await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, expoPushToken);
    await saveRegistrationMetadata({
      expoPushToken,
      voluntarioId,
      appVersion,
      platform: Platform.OS,
      deviceId,
      registeredAt: new Date().toISOString(),
    });
    console.log('[Notifications] Token registrado com sucesso.');
  } catch (error) {
    console.log('[Notifications] Erro ao enviar token para API:', error);
    console.log('[Notifications] Registro de push ignorado:', toErrorMessage(error));
    return expoPushToken;
  }

  return expoPushToken;
}

export async function deregisterPushToken(): Promise<void> {
  const storedMetadata = await getStoredRegistrationMetadata();
  const storedToken =
    (await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY)) || storedMetadata?.expoPushToken;

  try {
    if (storedToken) {
      await apiClient.delete('/me/push-tokens', {
        data: { expoPushToken: storedToken },
      });
      console.log('[Notifications] Token removido com sucesso.');
    }
  } catch (error) {
    console.log('[Notifications] Erro ao remover token:', error);
  } finally {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(PUSH_REGISTRATION_METADATA_STORAGE_KEY);
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
