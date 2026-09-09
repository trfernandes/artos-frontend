import axios from 'axios';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import { triggerUnauthorized } from '../../core/network/authBridge';
import { getAuthToken } from '../../core/storage/authTokenStorage';

// Contador de tentativas por request, usado pelo retry de falha de rede abaixo.
declare module 'axios' {
  export interface AxiosRequestConfig {
    _networkRetryCount?: number;
  }
}

// Falha de rede transitória (ERR_NETWORK = request não chegou a receber resposta):
// backend no Render acordando de cold start (~30-50s), Wi-Fi trocando, etc.
// Como não houve resposta, o servidor não processou nada — reenviar é seguro
// mesmo em POST. Backoff crescente cobre a janela do cold start.
const NETWORK_RETRY_BACKOFF_MS = [800, 2400, 6000];

function isTransientNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response && error.code === 'ERR_NETWORK';
}

// Evita empilhar N toasts quando várias requests falham juntas na mesma queda.
let lastNetworkToastAt = 0;
function notifyNetworkFailure() {
  const now = Date.now();
  if (now - lastNetworkToastAt < 5000) return;
  lastNetworkToastAt = now;
  Toast.show({
    type: 'error',
    text1: 'Sem conexão com o servidor',
    text2: 'Verifique sua internet e tente novamente.',
  });
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiBaseUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL não definida no bundle. Build sem essa env var embutida — nunca falar com backend por fallback silencioso.',
  );
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para anexar o token JWT automaticamente
apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints de auth retornam 401 para credenciais inválidas — não devem disparar signOut
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/voluntarios/cadastro',
];

export function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

let isHandling401 = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';

    if (status === 401 && !isHandling401 && !isAuthEndpoint(requestUrl)) {
      isHandling401 = true;
      try {
        triggerUnauthorized('expired');
      } finally {
        setTimeout(() => (isHandling401 = false), 500);
      }
    }

    // Retry de falha de rede transitória antes de desistir / reportar.
    const config = error?.config;
    if (isTransientNetworkError(error) && config) {
      const attempt = config._networkRetryCount ?? 0;
      if (attempt < NETWORK_RETRY_BACKOFF_MS.length) {
        config._networkRetryCount = attempt + 1;
        await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_BACKOFF_MS[attempt]));
        return apiClient(config);
      }
    }

    const retries = config?._networkRetryCount ?? 0;
    const exhaustedNetworkError = isTransientNetworkError(error);
    if (exhaustedNetworkError) {
      notifyNetworkFailure();
    }

    // Captura erros 5xx e falhas de rede/timeout no Sentry com contexto de endpoint.
    // Falha de rede só é reportada depois de esgotar os retries acima.
    const shouldCapture = (status && status >= 500) || (!error.response && error.code);
    if (shouldCapture) {
      Sentry.captureException(error, {
        tags: {
          http_status: String(status ?? 'network'),
          endpoint: requestUrl,
          method: (error?.config?.method || '').toUpperCase(),
        },
        contexts: {
          api: {
            url: requestUrl,
            baseURL: error?.config?.baseURL,
            status,
            code: error?.code,
            message: error?.message,
            retries,
          },
        },
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
