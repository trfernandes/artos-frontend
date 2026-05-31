type HSL = [number, number, number];

export const ColorUtils = {
  hexToHsl(hex: string): HSL | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number,
      s: number,
      l: number = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Saturacao zero para tons de cinza
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
          break;
      }
      h /= 6;
    }

    // Retorna os valores HSL em porcentagem
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  },
  hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // Tons de cinza
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    // Converte para hexadecimal
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },
  darkenColor(hex: string, amount: number = 0.2): string {
    // Garante que a cor começa com #
    if (!hex.startsWith('#')) hex = `#${hex}`;

    // Remove o # e converte para número
    const num = parseInt(hex.slice(1), 16);

    // Extrai componentes RGB
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Aplica fator de escurecimento (amount entre 0 e 1)
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));

    // Retorna em formato hexadecimal
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  },
  lightenColor(hex: string, amount: number = 0.2): string {
    // Garante que começa com #
    if (!hex.startsWith('#')) hex = `#${hex}`;

    // Remove o # e converte pra número
    const num = parseInt(hex.slice(1), 16);

    // Extrai componentes RGB
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Aumenta os valores RGB em direção ao branco (255)
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));

    // Retorna em formato hexadecimal
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  },
  getTextColorForBackground(hex: string): string {
    if (!hex.startsWith('#')) hex = `#${hex}`;
    const num = parseInt(hex.slice(1), 16);

    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;

    // Cálculo de luminância perceptual
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Se a cor for escura, usa texto branco; caso contrário, preto
    return luminance < 128 ? '#FFFFFF' : '#000000';
  },
  withAlpha(color: string, opacity: number): string {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (_match, r, g, b) => {
        return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${clampedOpacity})`;
      });
    }

    if (color.startsWith('rgb(')) {
      const rgbContent = color
        .replace('rgb(', '')
        .replace(')', '')
        .split(',')
        .map((value) => value.trim());
      if (rgbContent.length === 3) {
        return `rgba(${rgbContent[0]}, ${rgbContent[1]}, ${rgbContent[2]}, ${clampedOpacity})`;
      }
    }

    let normalized = color.trim();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);

    if (normalized.length === 3) {
      normalized = normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('');
    }

    if (normalized.length < 6) {
      return color;
    }

    const rawHex = normalized.slice(0, 6);
    const r = parseInt(rawHex.slice(0, 2), 16);
    const g = parseInt(rawHex.slice(2, 4), 16);
    const b = parseInt(rawHex.slice(4, 6), 16);

    if ([r, g, b].some((value) => Number.isNaN(value))) {
      return color;
    }

    return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
  },
  // Achata `color` aplicado em `opacity` sobre uma `base` OPACA e devolve uma cor opaca.
  // Use quando precisar do efeito de um tint translúcido mas sem fundo translúcido —
  // ex.: cards com `elevation`, onde rgba + sombra geram artefatos de composição no Android.
  blendOver(color: string, opacity: number, base: string): string {
    const fg = parseRgb(color);
    const bg = parseRgb(base);
    if (!fg || !bg) return color;

    const a = Math.max(0, Math.min(1, opacity));
    const mix = (f: number, b: number) => Math.round(f * a + b * (1 - a));

    return `rgb(${mix(fg[0], bg[0])}, ${mix(fg[1], bg[1])}, ${mix(fg[2], bg[2])})`;
  },
};

function parseRgb(color: string): [number, number, number] | null {
  const trimmed = color.trim();

  const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(trimmed);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((value) => parseFloat(value.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((value) => !Number.isNaN(value))) {
      return [parts[0], parts[1], parts[2]];
    }
    return null;
  }

  let normalized = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (normalized.length < 6) return null;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;

  return [r, g, b];
}
