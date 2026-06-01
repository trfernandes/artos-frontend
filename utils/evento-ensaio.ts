import { MinisterioTipoEnum } from '../domain/enums/Ministerio/ministerio-tipo.enum';
import { formatClockTime } from './date_utils';

type ResolveEventoEnsaioInfoParams = {
  horarioEnsaio?: string | null;
  horarioEnsaioPadrao?: string | null;
  isLouvor?: boolean;
  fallbackLabel?: string;
};

export function isLouvorMinisterioTipo(tipo: unknown): boolean {
  return (
    String(tipo ?? '') === String(MinisterioTipoEnum.Louvor) ||
    Number(tipo) === Number(MinisterioTipoEnum.Louvor)
  );
}

export function normalizeHorarioEnsaio(value?: string | null): string | undefined {
  return formatClockTime(value);
}

export function resolveEventoEnsaioInfo({
  horarioEnsaio,
  horarioEnsaioPadrao,
  isLouvor = false,
  fallbackLabel = 'Horário de ensaio a definir',
}: ResolveEventoEnsaioInfoParams) {
  const horario =
    normalizeHorarioEnsaio(horarioEnsaio) ?? normalizeHorarioEnsaio(horarioEnsaioPadrao);
  const shouldShow = isLouvor || !!horario;

  return {
    horario,
    shouldShow,
    label: shouldShow ? (horario ? `Ensaio às ${horario}` : fallbackLabel) : undefined,
  };
}
