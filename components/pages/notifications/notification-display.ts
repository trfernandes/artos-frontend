import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { formatAppDateTime, formatClockTime } from '../../../utils/date_utils';

type Payload = Record<string, any>;

const SCALE_TYPES = new Set<NotificacaoTipoEnum>([
  NotificacaoTipoEnum.EscalaLembrete,
  NotificacaoTipoEnum.EscalaPublicada,
  NotificacaoTipoEnum.EscalaAtualizada,
  NotificacaoTipoEnum.EscalaAlterada,
  NotificacaoTipoEnum.EscalaCancelada,
  NotificacaoTipoEnum.EscalaConfirmacaoSolicitada,
  NotificacaoTipoEnum.EscalaConfirmacaoPendente,
  NotificacaoTipoEnum.EscalaSubstituicaoSolicitada,
  NotificacaoTipoEnum.EscalaSubstituicaoAceita,
  NotificacaoTipoEnum.EscalaSubstituicaoRecusada,
  NotificacaoTipoEnum.EscalaTrocaSolicitada,
  NotificacaoTipoEnum.EscalaTrocaAprovada,
  NotificacaoTipoEnum.EscalaVoluntarioConfirmou,
  NotificacaoTipoEnum.EscalaVoluntarioRecusou,
  NotificacaoTipoEnum.EscalaSubstituicaoSolicitadaLider,
  NotificacaoTipoEnum.EscalaSubstituicaoResolvidaLider,
  NotificacaoTipoEnum.IndisponibilidadeConflito,
]);

function firstString(payload: Payload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function formatDateTimeLabel(value?: string) {
  if (!value) return undefined;
  const dateLabel = formatAppDateTime(value, 'dd/MM');
  const timeLabel = formatAppDateTime(value, 'HH:mm');
  if (!dateLabel) return undefined;
  if (!timeLabel || timeLabel === '00:00') return dateLabel;
  const compactTime = formatAppDateTime(value, timeLabel.endsWith(':00') ? "HH'h'" : "HH'h'mm");
  return [dateLabel, compactTime].filter(Boolean).join(' às ');
}

function scaleSubtitle(notification: ResponseNotificacaoDto, payload: Payload) {
  const eventoNome = firstString(payload, ['eventoNome', 'nomeEvento', 'evento']);
  const funcaoNome = firstString(payload, ['funcaoNome', 'nomeFuncao', 'funcao']);
  const dateSource = firstString(payload, [
    'dataOcorrencia',
    'dataEvento',
    'selectedDate',
    'date',
    'data',
  ]);
  const dateLabel = formatDateTimeLabel(dateSource);

  const parts = [eventoNome, funcaoNome, dateLabel].filter(Boolean);

  if (parts.length) return parts.join(' · ');
  return (
    notification.mensagem?.trim() || notification.titulo?.trim() || 'Toque para ver suas escalas.'
  );
}

function personSubtitle(notification: ResponseNotificacaoDto, payload: Payload) {
  const nome = firstString(payload, [
    'voluntarioNome',
    'nomeVoluntario',
    'nome',
    'convidadoNome',
    'nomeConvidado',
  ]);
  const email = firstString(payload, [
    'voluntarioEmail',
    'emailVoluntario',
    'email',
    'convidadoEmail',
    'emailConvidado',
  ]);
  const parts = [nome, email].filter(Boolean);
  return parts.length
    ? parts.join(' · ')
    : notification.mensagem?.trim() || notification.titulo?.trim() || 'Toque para ver os detalhes.';
}

function inviteSubtitle(notification: ResponseNotificacaoDto, payload: Payload) {
  const nome = firstString(payload, ['convidadoNome', 'nomeConvidado', 'nome', 'voluntarioNome']);
  const email = firstString(payload, [
    'convidadoEmail',
    'emailConvidado',
    'email',
    'voluntarioEmail',
  ]);
  const expiresAt = firstString(payload, ['expiraEm', 'dataExpiracao', 'expiresAt', 'expiredAt']);
  const expiresAtLabel = expiresAt ? formatAppDateTime(expiresAt, 'dd/MM/yyyy') : undefined;
  const parts = [nome, email, expiresAtLabel ? `Expirou em ${expiresAtLabel}` : undefined].filter(
    Boolean,
  );
  return parts.length
    ? parts.join(' · ')
    : notification.mensagem?.trim() || notification.titulo?.trim() || 'Convite expirado.';
}

function churchLinkSubtitle(notification: ResponseNotificacaoDto, payload: Payload) {
  const igrejaNome = firstString(payload, ['igrejaNome', 'nomeIgreja']);
  const voluntarioNome = firstString(payload, ['voluntarioNome', 'nomeVoluntario', 'nome']);
  const parts = [igrejaNome, voluntarioNome].filter(Boolean);
  return parts.length
    ? parts.join(' · ')
    : notification.mensagem?.trim() || notification.titulo?.trim() || 'Toque para ver os detalhes.';
}

export function getNotificationSubtitle(notification: ResponseNotificacaoDto) {
  const payload = notification.data ?? {};

  if (SCALE_TYPES.has(notification.tipo)) {
    return scaleSubtitle(notification, payload);
  }

  switch (notification.tipo) {
    case NotificacaoTipoEnum.IgrejaConviteAceito:
    case NotificacaoTipoEnum.IgrejaNovoVoluntario:
    case NotificacaoTipoEnum.MinisterioNovoIntegrante:
      return personSubtitle(notification, payload);
    case NotificacaoTipoEnum.IgrejaConviteExpirado:
      return inviteSubtitle(notification, payload);
    case NotificacaoTipoEnum.IgrejaVinculoSolicitado:
    case NotificacaoTipoEnum.IgrejaVinculoAprovado:
    case NotificacaoTipoEnum.IgrejaVinculoNegado:
      return churchLinkSubtitle(notification, payload);
    case NotificacaoTipoEnum.ComunicadoLider:
    case NotificacaoTipoEnum.SistemaAlertaAdmin:
    case NotificacaoTipoEnum.Generic:
    default:
      return (
        notification.mensagem?.trim() ||
        notification.titulo?.trim() ||
        'Toque para ver os detalhes.'
      );
  }
}
