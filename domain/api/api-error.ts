import axios from 'axios';

function parseMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === 'string' && item.trim()).join(', ');
    return joined || null;
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data: any = error.response?.data;

    const message = parseMessage(data?.message) || parseMessage(data?.error?.message);

    if (message) return message;

    if (status === 401) return 'Sessão expirada. Faça login novamente.';
    if (status === 403) return 'Você não tem permissão para acessar este recurso.';
    if (status === 400) return 'Requisição inválida. Verifique os dados informados.';
    if (status === 429) return 'Muitas tentativas seguidas. Aguarde um momento e tente novamente.';
    if (status === 502 || status === 503 || status === 504) {
      return 'Servidor indisponível no momento. Tente novamente em instantes.';
    }
    if (!error.response) return 'Sem conexão com o servidor. Verifique sua internet.';
  }

  return fallback;
}
