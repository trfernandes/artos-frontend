import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';

export type EscalaStatusBadgeStatus =
  EscalaStatusEnum | 'GERADA' | 'PUBLICADA' | 'RASCUNHO' | 'CANCELADA' | 'FECHADA' | 'EM_EDICAO';

function normalizeStatus(status: EscalaStatusBadgeStatus) {
  if (status === EscalaStatusEnum.Gerando) return 'GERANDO';
  if (status === EscalaStatusEnum.Gerada) return 'GERADA';
  if (status === EscalaStatusEnum.Publicada) return 'PUBLICADA';
  if (status === EscalaStatusEnum.Cancelada) return 'CANCELADA';
  if (status === EscalaStatusEnum.Erro) return 'ERRO';
  return status;
}

export function useEscalaStatusVisual(status: EscalaStatusBadgeStatus) {
  const palette = usePallete();

  const normalized = normalizeStatus(status);

  const colorMap: Record<string, string> = {
    GERANDO: palette.secondary,
    GERADA: palette.warning,
    PUBLICADA: palette.confirm,
    RASCUNHO: palette.fonts.inactive,
    CANCELADA: palette.fonts.inactive,
    ERRO: palette.error,
    FECHADA: palette.terciary,
    EM_EDICAO: palette.fonts.inactive,
  };

  const labelMap: Record<string, string> = {
    GERANDO: 'Gerando...',
    GERADA: 'Gerada',
    PUBLICADA: 'Publicada',
    RASCUNHO: 'Rascunho',
    CANCELADA: 'Cancelada',
    ERRO: 'Erro',
    FECHADA: 'Fechada',
    EM_EDICAO: 'Em edição',
  };

  const color = colorMap[normalized] ?? palette.primary;

  return {
    label: labelMap[normalized] ?? normalized,
    color,
    backgroundColor: ColorUtils.withAlpha(color, 0.12),
  };
}
