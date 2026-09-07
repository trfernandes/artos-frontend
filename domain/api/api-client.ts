import axios from 'axios';
import * as Sentry from '@sentry/react-native';
import { triggerUnauthorized } from '../../core/network/authBridge';
import { getAuthToken } from '../../core/storage/authTokenStorage';

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

    // Captura erros 5xx e falhas de rede/timeout no Sentry com contexto de endpoint
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
          },
        },
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
