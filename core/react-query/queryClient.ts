import { QueryClient } from '@tanstack/react-query';
import { normalizeAxiosError } from '../errors/normalizeAxiosError';

function shouldRetry(failureCount: number, error: unknown) {
  const appErr = normalizeAxiosError(error);
  // não retry em erros “do usuário”
  if (
    appErr.type === 'UNAUTHORIZED' ||
    appErr.type === 'FORBIDDEN' ||
    appErr.type === 'VALIDATION' ||
    appErr.type === 'NOT_FOUND'
  ) {
    return false;
  }
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        networkMode: 'online', // Pausa queries quando offline
      },
      mutations: {
        retry: false,
        networkMode: 'online', // Impede mutations quando offline
      },
    },
  });
}
