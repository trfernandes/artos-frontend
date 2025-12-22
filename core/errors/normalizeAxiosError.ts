import axios, { AxiosError } from 'axios';
import { AppError, AppErrorType } from './AppError';
import { defaultMessage } from './messages';

// Heurística simples p/ erros de rede comuns
function isNetworkDown(err: AxiosError): boolean {
  // axios sem response -> geralmente network/DNS/refused
  return !err.response;
}

function isTimeout(err: AxiosError): boolean {
  return (
    err.code === 'ECONNABORTED' ||
    String(err.message || '')
      .toLowerCase()
      .includes('timeout')
  );
}

function extractServerMessage(data: any): string | undefined {
  if (!data) return undefined;
  // seu padrão: { success:false, message:'Unauthorized', error:{ message:'Unauthorized' } }
  return data?.error?.message ?? data?.message ?? data?.msg;
}

function extractFieldErrors(data: any): Record<string, string> | undefined {
  // Ajuste conforme seu backend se você tiver errors por campo
  // Ex.: { error: { fields: { email: 'inválido' } } }
  return data?.error?.fields ?? data?.fields;
}

export function normalizeAxiosError(error: unknown, opts?: { isOffline?: boolean; isServerDown?: boolean }): AppError {
  if (error instanceof AppError) return error;

  if (!axios.isAxiosError(error)) {
    return new AppError('UNKNOWN', 'Erro inesperado.', undefined, { raw: error });
  }

  const err = error as AxiosError;

  // Offline (preferência)
  if (opts?.isOffline) {
    return new AppError('OFFLINE', defaultMessage('OFFLINE'));
  }

  // Timeout
  if (isTimeout(err)) {
    return new AppError('TIMEOUT', defaultMessage('TIMEOUT'));
  }

  // Sem response => server down / dns / refused
  if (isNetworkDown(err)) {
    return new AppError('SERVER_DOWN', defaultMessage('SERVER_DOWN'));
  }

  const status = err.response?.status;
  const data = err.response?.data;

  const serverMessage = extractServerMessage(data);
  const fields = extractFieldErrors(data);

  const type: AppErrorType =
    status === 401
      ? 'UNAUTHORIZED'
      : status === 403
      ? 'FORBIDDEN'
      : status === 404
      ? 'NOT_FOUND'
      : status === 409
      ? 'CONFLICT'
      : status === 429
      ? 'RATE_LIMIT'
      : status === 400
      ? 'VALIDATION'
      : status && status >= 500
      ? 'UNKNOWN'
      : 'UNKNOWN';

  const message = serverMessage ?? defaultMessage(type);

  return new AppError(type, message, status, { serverMessage, fields, raw: data });
}
