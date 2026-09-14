export const AnalyticsEvent = {
  EscalaCriada: 'escala_criada',
  EventoCriado: 'evento_criado',
  ConviteEnviado: 'convite_enviado',
  DisponibilidadeRespondida: 'disponibilidade_respondida',
  PushAberto: 'push_aberto',
  EscalaPublicada: 'escala_publicada',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Props de cada evento manual — whitelist explícita, nunca campos de texto livre
 * (nome, email, telefone). Cada builder recebe a entidade de domínio inteira e
 * extrai só ids/contagens/enums, pra call site não precisar lembrar disso toda vez.
 */

export function buildEscalaCriadaProps(params: {
  escalaId: string;
  ministerioId: string;
  qtdItens: number;
}) {
  return {
    escalaId: params.escalaId,
    ministerioId: params.ministerioId,
    qtdItens: params.qtdItens,
  };
}

export function buildEventoCriadoProps(params: {
  eventoId: string;
  igrejaId: string;
  tipo?: string;
}) {
  return {
    eventoId: params.eventoId,
    igrejaId: params.igrejaId,
    tipo: params.tipo ?? null,
  };
}

export function buildConviteEnviadoProps(params: {
  igrejaId: string;
  conviteId: string;
  autoApprove: boolean;
}) {
  return {
    igrejaId: params.igrejaId,
    conviteId: params.conviteId,
    autoApprove: params.autoApprove,
  };
}

export function buildDisponibilidadeRespondidaProps(params: {
  escalaItemId: string;
  disponivel: boolean;
}) {
  return {
    escalaItemId: params.escalaItemId,
    disponivel: params.disponivel,
  };
}

export function buildPushAbertoProps(params: { tipo: string; deepLink?: string }) {
  return {
    tipo: params.tipo,
    deepLink: params.deepLink ?? null,
  };
}

export function buildEscalaPublicadaProps(params: { escalaId: string; qtdItens: number }) {
  return {
    escalaId: params.escalaId,
    qtdItens: params.qtdItens,
  };
}
