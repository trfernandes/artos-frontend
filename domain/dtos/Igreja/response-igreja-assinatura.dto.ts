import { AssinaturaStatusEnum } from '../../enums/Igreja/assinatura-status.enum';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseIgrejaAssinaturaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  igreja: ResponseIgrejaDto;
  status: AssinaturaStatusEnum;
  plano: string;
  startedAt?: string | null;
  trialStartsAt?: string | null;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, any> | null;
};
