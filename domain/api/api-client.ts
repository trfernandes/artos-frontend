import axios from 'axios';
import { triggerUnauthorized } from '../../core/network/authBridge';
import { getAuthToken } from '../../core/storage/authTokenStorage';
import { beginRequest } from '../../core/network/slowRequestBridge';

const DEFAULT_API_URL = 'https://artos-backend-nwg5.onrender.com';
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rastreia requests em andamento pra avisar o usuário quando o backend/banco
// está "acordando" de cold start (ex.: Neon free tier suspende após ociosidade)
const requestEndHandlers = new WeakMap<object, () => void>();

// Interceptor para anexar o token JWT automaticamente
apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  requestEndHandlers.set(config, beginRequest());
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
  (res) => {
    requestEndHandlers.get(res.config)?.();
    return res;
  },
  async (error) => {
    requestEndHandlers.get(error?.config)?.();

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
    return Promise.reject(error);
  },
);

export default apiClient;
