import { addDays, subDays, subHours, subMinutes } from 'date-fns';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';

const now = new Date();

function iso(date: Date) {
  return date.toISOString();
}

function baseNotification(
  id: string,
  tipo: NotificacaoTipoEnum,
  titulo: string,
  mensagem: string,
  criadaEm: Date,
  lidaEm?: Date,
  data?: Record<string, any>,
): ResponseNotificacaoDto {
  const createdAt = iso(criadaEm);
  return {
    id,
    tipo,
    titulo,
    mensagem,
    createdAt,
    updatedAt: iso(lidaEm ?? criadaEm),
    criadaEm: createdAt,
    lidaEm: lidaEm ? iso(lidaEm) : undefined,
    data,
  };
}

export const MOCK_NOTIFICACOES: ResponseNotificacaoDto[] = [
  // ═══════════════════════════════════════════
  // HOJE — 3 notificações (não lidas)
  // ═══════════════════════════════════════════

  // Voluntário: Lembrete de escala amanhã
  baseNotification(
    'demo-001',
    NotificacaoTipoEnum.EscalaLembrete,
    'Lembrete de Escala',
    'Você está escalado amanhã no evento "Culto Domingo" como "Vocal".',
    subMinutes(now, 30),
    undefined,
    {
      dataOcorrencia: iso(new Date(addDays(now, 1).setHours(16, 0, 0, 0))),
      eventoNome: 'Culto Domingo',
      funcaoNome: 'Vocal',
    },
  ),

  // Líder: Voluntário confirmou presença
  baseNotification(
    'demo-002',
    NotificacaoTipoEnum.EscalaVoluntarioConfirmou,
    'Presença confirmada',
    'Ana confirmou presença no Culto de Domingo como Tecladista.',
    subHours(now, 1),
  ),

  // Voluntário: Substituição aceita
  baseNotification(
    'demo-003',
    NotificacaoTipoEnum.EscalaSubstituicaoAceita,
    'Substituição aceita',
    'Maria aceitou substituir você como Vocal no Culto de Domingo.',
    subHours(now, 3),
  ),

  // ═══════════════════════════════════════════
  // ONTEM — 2 notificações (não lidas)
  // ═══════════════════════════════════════════

  // Voluntário: Escala publicada
  baseNotification(
    'demo-004',
    NotificacaoTipoEnum.EscalaPublicada,
    'Escala publicada',
    'A escala de Março do ministério Louvor foi publicada. Confira suas datas!',
    subDays(now, 1),
  ),

  // Líder: Voluntário recusou presença
  baseNotification(
    'demo-005',
    NotificacaoTipoEnum.EscalaVoluntarioRecusou,
    'Presença recusada',
    'Lucas recusou a escala do Culto de Quarta como Guitarrista.',
    subDays(now, 1),
  ),

  // ═══════════════════════════════════════════
  // ÚLTIMOS 7 DIAS — 4 notificações (1 não lida + 3 lidas)
  // ═══════════════════════════════════════════

  // Voluntário: Pedido de substituição recebido (não lida)
  baseNotification(
    'demo-006',
    NotificacaoTipoEnum.EscalaSubstituicaoSolicitada,
    'Pedido de substituição',
    'João Silva pediu que você o substitua como Guitarrista no Culto de Sábado.',
    subDays(now, 2),
  ),

  // Voluntário: Escala alterada (lida)
  baseNotification(
    'demo-007',
    NotificacaoTipoEnum.EscalaAlterada,
    'Escala alterada',
    'Houve alteração na escala do evento "Culto de Domingo". Verifique os detalhes.',
    subDays(now, 3),
    subDays(now, 2),
  ),

  // Líder: Novo integrante no ministério (lida)
  baseNotification(
    'demo-008',
    NotificacaoTipoEnum.MinisterioNovoIntegrante,
    'Novo integrante',
    'Carlos foi adicionado ao ministério Louvor.',
    subDays(now, 4),
    subDays(now, 3),
  ),

  // Líder: Conflito de indisponibilidade (lida)
  baseNotification(
    'demo-009',
    NotificacaoTipoEnum.IndisponibilidadeConflito,
    'Conflito de escala',
    'Ana marcou indisponibilidade em 22/03, mas está escalada no Culto de Domingo.',
    subDays(now, 5),
    subDays(now, 4),
  ),

  // ═══════════════════════════════════════════
  // ESTE MÊS — 3 notificações (lidas)
  // ═══════════════════════════════════════════

  // Voluntário: Escala cancelada
  baseNotification(
    'demo-010',
    NotificacaoTipoEnum.EscalaCancelada,
    'Escala cancelada',
    'A escala do evento "Reunião de Oração" foi cancelada.',
    subDays(now, 9),
    subDays(now, 8),
  ),

  // Voluntário: Confirmação pendente
  baseNotification(
    'demo-011',
    NotificacaoTipoEnum.EscalaConfirmacaoPendente,
    'Confirmação pendente',
    'Você ainda não confirmou presença na escala de domingo no ministério Louvor.',
    subDays(now, 10),
    subDays(now, 9),
  ),

  // Líder: Substituição solicitada entre voluntários
  baseNotification(
    'demo-012',
    NotificacaoTipoEnum.EscalaSubstituicaoSolicitadaLider,
    'Substituição solicitada',
    'João solicitou substituição a Maria para o evento Culto de Sábado (Baixo).',
    subDays(now, 12),
    subDays(now, 11),
  ),

  // ═══════════════════════════════════════════
  // MAIS ANTIGAS — 4 notificações (lidas)
  // ═══════════════════════════════════════════

  // Líder: Substituição resolvida
  baseNotification(
    'demo-013',
    NotificacaoTipoEnum.EscalaSubstituicaoResolvidaLider,
    'Substituição resolvida',
    'Maria aceitou substituir João como Baixo no Culto de Sábado.',
    subDays(now, 35),
    subDays(now, 34),
  ),

  // Admin: Novo voluntário na igreja
  baseNotification(
    'demo-014',
    NotificacaoTipoEnum.IgrejaNovoVoluntario,
    'Novo voluntário na igreja',
    'Fernanda agora faz parte da Igreja Esperança. Que tal adicioná-la a um ministério?',
    subDays(now, 40),
    subDays(now, 38),
  ),

  // Admin: Convite aceito
  baseNotification(
    'demo-015',
    NotificacaoTipoEnum.IgrejaConviteAceito,
    'Convite aceito',
    'Pedro aceitou o convite e entrou na igreja.',
    subDays(now, 45),
    subDays(now, 44),
  ),

  // Voluntário: Substituição recusada
  baseNotification(
    'demo-016',
    NotificacaoTipoEnum.EscalaSubstituicaoRecusada,
    'Substituição recusada',
    'Pedro não pôde aceitar seu pedido de substituição para o Ensaio de Quarta.',
    subDays(now, 50),
    subDays(now, 49),
  ),
];
