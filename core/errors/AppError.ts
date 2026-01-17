export type AppErrorType =
  | 'OFFLINE'
  | 'SERVER_DOWN'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

export type AppErrorDetails = {
  serverMessage?: string;
  fields?: Record<string, string>; // validação por campo
  raw?: any;
};

export class AppError extends Error {
  constructor(
    public readonly type: AppErrorType,
    message: string,
    public readonly status?: number,
    public readonly details?: AppErrorDetails,
  ) {
    super(message);
  }
}
