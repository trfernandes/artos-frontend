import {
  differenceInCalendarDays,
  format,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const DateUtils = {
  getMonthName(monthIndex: number): string {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return monthNames[monthIndex];
  },
  compareOnlyDate(data1: Date, data2: Date): boolean {
    return (
      data1.getFullYear?.() === data2.getFullYear?.() &&
      data1.getMonth?.() === data2.getMonth?.() &&
      data1.getDate?.() === data2.getDate?.()
    );
  },
  formatHour(hour: number, minute: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hour)}:${pad(minute)}`;
  },
  formatToBrDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  },
  timeAgoText(dateInput: number | Date): string {
    const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Menos de 1 minuto
    if (seconds < 60) {
      return seconds === 0 ? 'agora mesmo' : `${seconds} segundos atrás`;
    }

    const minutes = Math.floor(seconds / 60);
    // Menos de 1 hora
    if (minutes < 60) {
      return `${minutes} minuto${minutes === 1 ? '' : 's'} atrás`;
    }

    const hours = Math.floor(minutes / 60);
    // Menos de 24 horas
    if (hours < 24) {
      return `${hours} hora${hours === 1 ? '' : 's'} atrás`;
    }

    const days = Math.floor(hours / 24);
    // Menos de 30 dias (aproximadamente 1 mês)
    if (days < 30) {
      return `${days} dia${days === 1 ? '' : 's'} atrás`;
    }

    const months = Math.floor(days / 30); // Aproximação para meses
    // Menos de 12 meses (aproximadamente 1 ano)
    if (months < 12) {
      return `${months} mês${months === 1 ? '' : 'es'} atrás`;
    }

    const years = Math.floor(months / 12);
    // Mais de 1 ano
    return `${years} ano${years === 1 ? '' : 's'} atrás`;
  },
  generateDatesBetween(start: Date, end: Date): Date[] {
    const result: Date[] = [];
    const cur = new Date(start);

    // zera horas para evitar problemas de fuso
    cur.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (cur <= endDate) {
      result.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return result;
  },
  equal(a?: Date, b?: Date) {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },
  normalizeLocalDay(date: Date): Date {
    const zoned = toZonedTime(date, APP_TZ); // UTC -> TZ (ou interpreta date como instante e "vê" na TZ)
    return startOfDay(zoned);
  },
  localDayToUtcDate(date: Date): Date {
    const localDay = this.normalizeLocalDay(date);
    return fromZonedTime(localDay, APP_TZ); // TZ -> UTC
  },
  dayKey(date: Date): string {
    return formatInTimeZone(date, APP_TZ, 'yyyy-MM-dd');
  },
  sameDay(a: Date, b: Date): boolean {
    return this.dayKey(a) === this.dayKey(b);
  },
  toApiDateOnly(d: Date): string {
    // gera YYYY-MM-DD na timezone local do device (ou padronize com date-fns)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },
  formatStableDateBR(d: Date) {
    return formatInTimeZone(d, APP_TZ, 'dd/MM/yyyy', { locale: ptBR });
  },
};

export type DateOnlyString = `${number}-${number}-${number}`; // "YYYY-MM-DD" (typing leve)
export type IsoDateTimeString = string; // ISO 8601

export const DateUtilsApi = {
  dateOnlyFromApi(value: string | Date, tz: string = APP_TZ): Date {
    // 1) Normaliza para "yyyy-MM-dd"
    const ymd =
      value instanceof Date ? formatInTimeZone(value, tz, 'yyyy-MM-dd') : value.slice(0, 10); // pega "YYYY-MM-DD" mesmo se vier ISO

    // 2) Constrói Date local (meio-dia local = mais seguro)
    const [y, m, d] = ymd.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);

    if (!isValid(date)) {
      throw new Error(`dateOnlyFromApi: data inválida: ${String(value)} (ymd=${ymd})`);
    }

    return date;
  },
  dateOnlyToApi(value: Date | string): DateOnlyString {
    if (typeof value === 'string') {
      // assume já está no formato certo
      return value as DateOnlyString;
    }
    // Usar partes UTC para preservar o dia calendário independentemente de como o
    // Date foi criado: pickers criam UTC midnight (new Date('2026-06-01')), que em
    // UTC-3 vira 31/05 no horário local — format() local retornaria a data errada.
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}` as DateOnlyString;
  },
  dateTimeFromApi(value: string | Date): Date {
    if (value instanceof Date) return value;

    const parsed = parseISO(value);
    if (!isValid(parsed)) throw new Error(`dateTimeFromApi: ISO inválido: ${String(value)}`);
    return parsed;
  },
  dateTimeToApi(value: Date | string): IsoDateTimeString {
    if (typeof value === 'string') {
      return value;
    }
    return value.toISOString();
  },
  isSameDateOnly(a: Date | string, b: Date | string): boolean {
    return this.dateOnlyToApi(a as any) === this.dateOnlyToApi(b as any);
  },
  compareDateOnlyFromApi(dateFromApi: string, b: Date): boolean {
    const normalizedDateFromApi = this.dateOnlyFromApi(dateFromApi);
    return isSameDay(normalizedDateFromApi, b);
  },
  compareDateTime(a: Date | string, b: Date | string): number {
    const ta = (a instanceof Date ? a : this.dateTimeFromApi(a)).getTime();
    const tb = (b instanceof Date ? b : this.dateTimeFromApi(b)).getTime();
    return ta - tb;
  },
};

export const APP_TZ = 'America/Sao_Paulo';

export type DateLike = Date | string | null | undefined;

function parseDateTimeSafe(value: DateLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;

  try {
    const parsed = DateUtilsApi.dateTimeFromApi(value);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getAppDateOnlyKey(value: DateLike, tz: string = APP_TZ): DateOnlyString | null {
  if (!value) return null;
  if (value instanceof Date) {
    return formatInTimeZone(value, tz, 'yyyy-MM-dd') as DateOnlyString;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10) as DateOnlyString;
  }

  const parsed = parseDateTimeSafe(trimmed);
  return parsed ? (formatInTimeZone(parsed, tz, 'yyyy-MM-dd') as DateOnlyString) : null;
}

export function normalizeClockTime(value: DateLike, tz: string = APP_TZ): string | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[2];
      const second = match[3] ?? '00';
      return `${hour}:${minute}:${second}`;
    }
  }

  const parsed = parseDateTimeSafe(value);
  return parsed ? formatInTimeZone(parsed, tz, 'HH:mm:ss') : undefined;
}

export function formatClockTime(
  value: DateLike,
  compact = false,
  tz: string = APP_TZ,
): string | undefined {
  const normalized = normalizeClockTime(value, tz);
  if (!normalized) return undefined;

  const [hour, minute] = normalized.split(':');
  if (compact) return minute === '00' ? `${hour}h` : `${hour}h${minute}`;
  return `${hour}:${minute}`;
}

export function formatAppDateTime(
  value: DateLike,
  pattern: string,
  options?: Parameters<typeof formatInTimeZone>[3],
): string | undefined {
  const parsed = parseDateTimeSafe(value);
  if (!parsed) return undefined;
  return formatInTimeZone(parsed, APP_TZ, pattern, { locale: ptBR, ...options });
}

export function formatDataInclusaoRelativa(value: DateLike): string | undefined {
  const parsed = parseDateTimeSafe(value);
  if (!parsed) return undefined;

  const hoje = DateUtils.normalizeLocalDay(new Date());
  const data = DateUtils.normalizeLocalDay(parsed);
  const dias = differenceInCalendarDays(hoje, data);

  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `Há ${dias} dias`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `Há ${semanas} semana${semanas === 1 ? '' : 's'}`;
  }
  if (dias < 90) {
    const meses = Math.floor(dias / 30);
    return `Há ${meses} mês${meses === 1 ? '' : 'es'}`;
  }

  return DateUtils.formatStableDateBR(parsed);
}

export function combineAppDateWithTime(
  dateSource: DateLike,
  timeSource: DateLike,
  dayOffset = 0,
): Date {
  const dateOnly = getAppDateOnlyKey(dateSource) ?? getAppDateOnlyKey(new Date())!;
  const dateOnlyDate = DateUtilsApi.dateOnlyFromApi(dateOnly);

  if (dayOffset !== 0) {
    dateOnlyDate.setDate(dateOnlyDate.getDate() + dayOffset);
  }

  const shiftedDateOnly = format(dateOnlyDate, 'yyyy-MM-dd');
  const timeOnly = normalizeClockTime(timeSource) ?? '00:00:00';
  return fromZonedTime(`${shiftedDateOnly}T${timeOnly}`, APP_TZ);
}

export default DateUtils;
