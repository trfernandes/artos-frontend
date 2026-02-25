import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { NotificacaoTipoEnum } from '../domain/enums/Notificacao/tipo-notificacao.enum';
import { emitNotificationEvent } from '../core/events/notification-events';

type NotificationPayload = Record<string, any> | null | undefined;

export type NotificationNavigationTarget = {
  pathname: string;
  params?: Record<string, string | number | boolean>;
};

function normalizePath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function coercePayload(rawPayload: NotificationPayload): Record<string, any> | null {
  if (!rawPayload || typeof rawPayload !== 'object') return null;
  const payload = rawPayload as Record<string, any>;
  const nestedData = payload.data;

  if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
    return {
      ...payload,
      ...(nestedData as Record<string, any>),
    };
  }

  return payload;
}

function normalizeParams(params?: Record<string, any>): Record<string, string | number | boolean> | undefined {
  if (!params || typeof params !== 'object') return undefined;

  const normalized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = value;
    } else {
      normalized[key] = JSON.stringify(value);
    }
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

function parseRouteWithQuery(route: string): NotificationNavigationTarget | null {
  const [rawPath, rawQuery] = route.split('?');
  const pathname = normalizePath(rawPath || '');
  if (!pathname) return null;

  if (!rawQuery) {
    return { pathname };
  }

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(rawQuery);
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return { pathname, params: Object.keys(params).length ? params : undefined };
}

function resolveFromDeepLink(deepLink: string): NotificationNavigationTarget | null {
  const trimmed = deepLink.trim();
  if (!trimmed) return null;

  if (trimmed.includes('://')) {
    const parsed = Linking.parse(trimmed);
    const parsedPath = parsed.path || '';
    const fromPath = parseRouteWithQuery(parsedPath);
    if (!fromPath) return null;
    return {
      pathname: fromPath.pathname,
      params: normalizeParams(parsed.queryParams as Record<string, any>),
    };
  }

  return parseRouteWithQuery(trimmed);
}

function resolveByTipo(payload: Record<string, any>): NotificationNavigationTarget {
  const tipo = payload.tipo as NotificacaoTipoEnum | undefined;

  switch (tipo) {
    case NotificacaoTipoEnum.EscalaLembrete:
      return { pathname: '/(app)/(drawer)/pessoal/escalas' };
    case NotificacaoTipoEnum.IgrejaVinculoSolicitado:
      return { pathname: '/(app)/(drawer)/admin/solicitacoes' };
    case NotificacaoTipoEnum.IgrejaConviteAceito:
    case NotificacaoTipoEnum.IgrejaVinculoAprovado:
    case NotificacaoTipoEnum.IgrejaVinculoNegado:
      return { pathname: '/notifications' };
    default:
      return { pathname: '/notifications' };
  }
}

export function resolveNotificationTarget(rawPayload: NotificationPayload): NotificationNavigationTarget | null {
  const payload = coercePayload(rawPayload);
  if (!payload) return null;

  const deepLink =
    typeof payload.deepLink === 'string'
      ? payload.deepLink
      : typeof payload.deeplink === 'string'
        ? payload.deeplink
        : undefined;
  if (deepLink) {
    const deepLinkTarget = resolveFromDeepLink(deepLink);
    if (deepLinkTarget) return deepLinkTarget;
  }

  const route = typeof payload.route === 'string' ? payload.route : undefined;
  if (route) {
    const routeTarget = parseRouteWithQuery(route);
    if (routeTarget) {
      return {
        pathname: routeTarget.pathname,
        params: normalizeParams(payload.params as Record<string, any>) ?? routeTarget.params,
      };
    }
  }

  return resolveByTipo(payload);
}

export function openNotification(
  rawPayload: NotificationPayload,
  source: 'push' | 'inbox' | 'unknown' = 'unknown',
) {
  const payload = coercePayload(rawPayload);
  const target = resolveNotificationTarget(rawPayload);
  if (!target) return false;

  if (target.params && Object.keys(target.params).length > 0) {
    router.push({
      pathname: target.pathname as any,
      params: target.params as any,
    });
  } else {
    router.push(target.pathname as any);
  }

  emitNotificationEvent('notification_opened', {
    payload: payload || {},
    source,
  });
  return true;
}
