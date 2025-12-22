import { QueryClient } from '@tanstack/react-query';
import { normalizeAxiosError } from '../errors/normalizeAxiosError';

function shouldRetry(failureCount: number, error: unknown) {
  const appErr = normalizeAxiosError(error);
  // não retry em erros “do usuário”
  if (appErr.type === 'UNAUTHORIZED' || appErr.type === 'FORBIDDEN' || appErr.type === 'VALIDATION' || appErr.type === 'NOT_FOUND') {
    return false;
  }
  // retry limitado
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
