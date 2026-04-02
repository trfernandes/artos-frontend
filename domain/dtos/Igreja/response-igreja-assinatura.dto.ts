import { AssinaturaStatusEnum } from '../../enums/Igreja/assinatura-status.enum';
import { ResponseIgrejaDto } from './response-igreja.dto';

export type ResponseAssinaturaPlanoDto = {
  codigo: string;
  nome: string;
  descricao: string;
  limiteVoluntarios: number | null;
  limiteMinisterios: number | null;
  precoMensalCentavos: number | null;
  precoAnualCentavos: number | null;
};

export type ResponseAssinaturaUsoAtualDto = {
  voluntariosAtivos: number;
  ministeriosAtivos: number;
};

export type ResponseAssinaturaAvisoDto = {
  tipo: 'near_limit' | 'upgrade_required' | 'payment_due' | 'trial_ending';
  titulo: string;
  mensagem: string;
};

export type ResponseIgrejaAssinaturaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  igreja: ResponseIgrejaDto;
  status: AssinaturaStatusEnum;
  plano: string;
  periodicidade: string;
  gateway: string;
  checkoutUrl?: string | null;
  nextPlano?: string | null;
  nextPeriodicidade?: string | null;
  nextPlanEffectiveAt?: string | null;
  descontoPercentual?: number | null;
  descontoCodigo?: string | null;
  descontoValidoAte?: string | null;
  isencaoMotivo?: string | null;
  pausedUntil?: string | null;
  startedAt?: string | null;
  trialStartsAt?: string | null;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  expiresAt?: string | null;
  planoAtual?: ResponseAssinaturaPlanoDto;
  proximoPlano?: ResponseAssinaturaPlanoDto | null;
  usoAtual?: ResponseAssinaturaUsoAtualDto;
  avisos?: ResponseAssinaturaAvisoDto[];
  metadata?: Record<string, any> | null;
};
