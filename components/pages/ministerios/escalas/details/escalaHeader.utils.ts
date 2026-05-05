import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type HealthTone = 'success' | 'warning' | 'danger';

export type StatusDistribution = {
  confirmado: number;
  pendente: number;
  ausente: number;
  substituido: number;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function normalizeMonth(monthToken: string): string {
  const normalized = monthToken.replace('.', '').trim();
  if (!normalized) return normalized;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatMonth(date: Date): string {
  return normalizeMonth(format(date, 'MMM', { locale: ptBR }));
}

export function formatShortDate(date: Date, includeYear = false): string {
  const day = format(date, 'dd', { locale: ptBR });
  const month = formatMonth(date);
  if (includeYear) {
    const year = format(date, 'yyyy');
    return `${day} ${month} ${year}`;
  }
  return `${day} ${month}`;
}

export function formatPeriod(start: Date, end: Date): string {
  const startDay = format(start, 'dd', { locale: ptBR });
  const endDay = format(end, 'dd', { locale: ptBR });
  const startMonth = formatMonth(start);
  const endMonth = formatMonth(end);
  const sameMonth = format(start, 'MM') === format(end, 'MM');
  const sameYear = format(start, 'yyyy') === format(end, 'yyyy');

  if (sameMonth && sameYear) {
    return `${startDay}–${endDay} ${startMonth}`;
  }

  if (sameYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} ${format(start, 'yyyy')} – ${endDay} ${endMonth} ${format(end, 'yyyy')}`;
}

export function formatRelativeOrDate(updatedAt: Date, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - updatedAt.getTime());

  if (diffMs < MINUTE_MS) {
    return 'agora';
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `há ${minutes} min`;
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `há ${hours} h`;
  }

  if (diffMs < DAY_MS * 7) {
    const days = Math.floor(diffMs / DAY_MS);
    return `há ${days} dias`;
  }

  return `em ${formatShortDate(updatedAt)}`;
}

export function isStaleUpdate(updatedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - updatedAt.getTime() > DAY_MS * 10;
}

export function getHealthTone(confirmedCount: number, totalCount: number): HealthTone {
  if (totalCount <= 0) return 'danger';
  const ratio = confirmedCount / totalCount;
  if (ratio >= 0.85) return 'success';
  if (ratio >= 0.6) return 'warning';
  return 'danger';
}

export function getHealthPercent(confirmedCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  const percent = (confirmedCount / totalCount) * 100;
  return Math.max(0, Math.min(100, percent));
}
