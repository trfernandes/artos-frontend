import { Dimensions, PixelRatio } from 'react-native';

export const REGULAR_FONT = 'MontserratRegular';
export const BOLD_FONT = 'MontserratBold';
export const SEMI_BOLD_FONT = 'MontserratSemiBold';
export const MEDIUM_FONT = 'MontserratMedium';
export const ITALIC_FONT = 'MontserratItalic';
export const ITALIC_BOLD_FONT = 'MontserratBoldItalic';
export const ITALIC_SEMI_BOLD_FONT = 'MontserratSemiBoldItalic';
export const ITALIC_MEDIUM_FONT = 'MontserratMediumItalic';

const BASE_WIDTH = 390; // iPhone 14/15 standard width as baseline
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_SCALE = SCREEN_WIDTH / BASE_WIDTH;

// allowFontScaling nativo é ignorado no iOS quando Fabric/New Architecture está
// ativo (bug conhecido do RN: github.com/facebook/react-native/issues/34990).
// Escala manual via PixelRatio.getFontScale() contorna isso.
// Clamp entre 0.85–1.3 pra não quebrar layout em configurações extremas.
let CLAMPED_FONT_SCALE = Math.min(Math.max(PixelRatio.getFontScale(), 0.85), 1.3);

export function scaledFont(size: number): number {
  return Math.round(size * SCREEN_SCALE * CLAMPED_FONT_SCALE);
}

// Piso de 11px — nada abaixo disso é legível sem depender do usuário aumentar a fonte do sistema.
export let EXTRA_SMALL_SIZE_FONT = scaledFont(11);
export let SMALL_SIZE_FONT = scaledFont(12);
export let MEDIUM_SIZE_FONT = scaledFont(13);
export let MEDIUM_LARGE_SIZE_FONT = scaledFont(14);
export let LARGE_MEDIUM_SIZE_FONT = scaledFont(15);
export let SEMI_LARGE_SIZE_FONT = scaledFont(16);
export let LARGE_SIZE_FONT = scaledFont(17);
export let LARGE_PLUS_SIZE_FONT = scaledFont(18);
export let TITLE_SIZE_FONT = scaledFont(20);
export let TITLE_LARGE_SIZE_FONT = scaledFont(22);
export let EXTRA_LARGE_SIZE_FONT = scaledFont(25);
export let DISPLAY_SIZE_FONT = scaledFont(28);
export let DISPLAY_LARGE_SIZE_FONT = scaledFont(40);

// Chamado ao voltar pro foreground (ver app/_layout.tsx) — RN não expõe evento
// de mudança de fonte do sistema, então relemos PixelRatio.getFontScale() manualmente.
// Named exports de ES module são live bindings: reatribuir aqui já propaga o valor
// novo pra todo import { X_SIZE_FONT } existente, sem precisar tocar nos ~20 arquivos
// que importam essas constantes direto — só precisam re-renderizar (ver forceUpdate no root).
export function refreshFontScale(): boolean {
  const nextScale = Math.min(Math.max(PixelRatio.getFontScale(), 0.85), 1.3);
  if (nextScale === CLAMPED_FONT_SCALE) return false;

  CLAMPED_FONT_SCALE = nextScale;
  EXTRA_SMALL_SIZE_FONT = scaledFont(11);
  SMALL_SIZE_FONT = scaledFont(12);
  MEDIUM_SIZE_FONT = scaledFont(13);
  MEDIUM_LARGE_SIZE_FONT = scaledFont(14);
  LARGE_MEDIUM_SIZE_FONT = scaledFont(15);
  SEMI_LARGE_SIZE_FONT = scaledFont(16);
  LARGE_SIZE_FONT = scaledFont(17);
  LARGE_PLUS_SIZE_FONT = scaledFont(18);
  TITLE_SIZE_FONT = scaledFont(20);
  TITLE_LARGE_SIZE_FONT = scaledFont(22);
  EXTRA_LARGE_SIZE_FONT = scaledFont(25);
  DISPLAY_SIZE_FONT = scaledFont(28);
  DISPLAY_LARGE_SIZE_FONT = scaledFont(40);
  return true;
}
