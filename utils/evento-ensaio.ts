import { formatInTimeZone } from 'date-fns-tz';
import { MinisterioTipoEnum } from '../domain/enums/Ministerio/ministerio-tipo.enum';
import { APP_TZ, DateUtilsApi } from './date_utils';

type ResolveEventoEnsaioInfoParams = {
  horarioEnsaio?: string | null;
  horarioEnsaioPadrao?: string | null;
  isLouvor?: boolean;
  fallbackLabel?: string;
};

export function isLouvorMinisterioTipo(tipo: unknown): boolean {
  return String(tipo ?? '') === String(MinisterioTipoEnum.Louvor)
    || Number(tipo) === Number(MinisterioTipoEnum.Louvor);
}

export function normalizeHorarioEnsaio(value?: string | null): string | undefined {
  if (!value) return undefined;

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  try {
    const parsed = DateUtilsApi.dateTimeFromApi(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return formatInTimeZone(parsed, APP_TZ, 'HH:mm');
  } catch {
    return undefined;
  }
}

export function resolveEventoEnsaioInfo({
  horarioEnsaio,
  horarioEnsaioPadrao,
  isLouvor = false,
  fallbackLabel = 'Horário de ensaio a definir',
}: ResolveEventoEnsaioInfoParams) {
  const horario = normalizeHorarioEnsaio(horarioEnsaio) ?? normalizeHorarioEnsaio(horarioEnsaioPadrao);
  const shouldShow = isLouvor || !!horario;

  return {
    horario,
    shouldShow,
    label: shouldShow ? (horario ? `Ensaio às ${horario}` : fallbackLabel) : undefined,
  };
}
