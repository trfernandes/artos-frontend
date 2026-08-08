import { useMemo } from 'react';
import { usePallete } from '../hooks/usePallete';
import { RepertorioMusicaSecaoTipoEnum } from '../domain/dtos/Repertorio/repertorio-musica-secao.response';

export type SecaoVisual = {
  label: string;
  color: string;
  icon: string;
};

export function useSecaoVisualMap() {
  const palette = usePallete();

  return useMemo<Record<RepertorioMusicaSecaoTipoEnum, SecaoVisual>>(
    () => ({
      [RepertorioMusicaSecaoTipoEnum.INTRO]: {
        label: 'Intro',
        color: palette.primary,
        icon: 'play-circle-outline',
      },
      [RepertorioMusicaSecaoTipoEnum.ESTROFE]: {
        label: 'Estrofe',
        color: palette.secondary,
        icon: 'format-text',
      },
      [RepertorioMusicaSecaoTipoEnum.PRE_REFRAO]: {
        label: 'Pré-refrão',
        color: palette.terciary,
        icon: 'arrow-collapse-up',
      },
      [RepertorioMusicaSecaoTipoEnum.REFRAO]: {
        label: 'Refrão',
        color: palette.confirm,
        icon: 'repeat',
      },
      [RepertorioMusicaSecaoTipoEnum.PONTE]: {
        label: 'Ponte',
        color: '#6D5EF3',
        icon: 'bridge',
      },
      [RepertorioMusicaSecaoTipoEnum.SOLO]: {
        label: 'Solo',
        color: '#E67E22',
        icon: 'music-note-eighth',
      },
      [RepertorioMusicaSecaoTipoEnum.INSTRUMENTAL]: {
        label: 'Instrumental',
        color: '#0EA5A5',
        icon: 'music-clef-treble',
      },
      [RepertorioMusicaSecaoTipoEnum.FINAL]: {
        label: 'Final',
        color: '#475569',
        icon: 'flag-checkered',
      },
      [RepertorioMusicaSecaoTipoEnum.PERSONALIZADO]: {
        label: 'Personalizada',
        color: '#9B59B6',
        icon: 'pencil-outline',
      },
    }),
    [palette.confirm, palette.primary, palette.secondary, palette.terciary],
  );
}
