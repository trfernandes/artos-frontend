import { AuditLogAcaoEnum } from '../../enums/AuditLog/audit-log-acao.enum';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';

export type ResponseAuditLogDto = {
  id: string;
  createdAt: string;
  igrejaId: string;
  ministerioId?: string | null;
  autorId: string;
  autor?: ResponseVoluntarioDto;
  acao: AuditLogAcaoEnum;
  entidade: string;
  entidadeId?: string | null;
  descricao: string;
};

export type GetAuditLogParams = {
  igrejaId: string;
  ministerioId?: string;
};
