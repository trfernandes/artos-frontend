import apiClient from './api-client';
import { GetAuditLogParams, ResponseAuditLogDto } from '../dtos/AuditLog/audit-log.response';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message?: string;
    error?: string;
    statusCode?: number;
  } | null;
};

export class AuditLogApi {
  static async listar(params: GetAuditLogParams): Promise<ResponseAuditLogDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseAuditLogDto[]>>('/audit-logs', {
      params,
    });
    return response.data.data;
  }
}
