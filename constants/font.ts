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
// Clamp fontScale between 0.85–1.3 to prevent broken layouts at extreme settings
const CLAMPED_FONT_SCALE = Math.min(Math.max(PixelRatio.getFontScale(), 0.85), 1.3);
const GLOBAL_FONT_BOOST = 1.05;

export function scaledFont(size: number): number {
  return Math.round(size * SCREEN_SCALE * CLAMPED_FONT_SCALE * GLOBAL_FONT_BOOST);
}

export const EXTRA_SMALL_SIZE_FONT = scaledFont(11);
export const SMALL_SIZE_FONT = scaledFont(12);
export const MEDIUM_SIZE_FONT = scaledFont(13);
export const LARGE_MEDIUM_SIZE_FONT = scaledFont(15);
export const LARGE_SIZE_FONT = scaledFont(17);
export const EXTRA_LARGE_SIZE_FONT = scaledFont(25);
