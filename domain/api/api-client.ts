import axios from 'axios';
import { triggerUnauthorized } from '../../core/network/authBridge';
import { getAuthToken } from '../../core/storage/authTokenStorage';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.EXPO_PUBLIC_APP_SECRET_KEY || '',
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

let isHandling401 = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isHandling401) {
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
