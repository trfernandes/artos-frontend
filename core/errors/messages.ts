import { AppErrorType } from './AppError';

export function defaultMessage(type: AppErrorType) {
  switch (type) {
    case 'OFFLINE':
      return 'Sem conexão com a internet.';
    case 'SERVER_DOWN':
      return 'Servidor indisponível. Tente novamente em instantes.';
    case 'TIMEOUT':
      return 'Tempo de resposta excedido. Tente novamente.';
    case 'UNAUTHORIZED':
      return 'Sessão expirada. Faça login novamente.';
    case 'FORBIDDEN':
      return 'Você não tem permissão para realizar esta ação.';
    case 'NOT_FOUND':
      return 'Recurso não encontrado.';
    case 'VALIDATION':
      return 'Verifique os dados informados.';
    case 'CONFLICT':
      return 'Conflito de dados. Atualize e tente novamente.';
    case 'RATE_LIMIT':
      return 'Muitas tentativas. Aguarde alguns segundos.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
