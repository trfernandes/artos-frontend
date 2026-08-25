import { AuditLogApi } from '../api/AuditLogApi';
import { GetAuditLogParams, ResponseAuditLogDto } from '../dtos/AuditLog/audit-log.response';

class AuditLogRepositoryClass {
  listar(params: GetAuditLogParams): Promise<ResponseAuditLogDto[]> {
    return AuditLogApi.listar(params);
  }
}

export const AuditLogRepository = new AuditLogRepositoryClass();
