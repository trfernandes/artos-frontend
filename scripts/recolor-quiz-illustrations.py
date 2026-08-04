# Recolori as ilustrações do quiz-vendas-funcionalidades: hue-shift restrito à faixa
# peach/laranja (~10-45 graus) pra azul/verde-sálvia, preservando saturação/valor
# (silhueta e sombreado da ilustração intactos, só a matiz muda).
import sys
import numpy as np
from PIL import Image

WARM_HUE_MIN = 10 / 360
WARM_HUE_MAX = 45 / 360
TARGET_HUE_MIN = 140 / 360  # verde-sálvia (era 165 — pouca separação do azul, quase monocromático)
TARGET_HUE_MAX = 215 / 360  # azul suave
MIN_SATURATION = 0.12  # abaixo disso é quase cinza/branco, não mexe

def recolor(path_in, path_out):
    im = Image.open(path_in).convert('RGBA')
    arr = np.asarray(im).astype(np.float32) / 255.0
    rgb = arr[..., :3]
    alpha = arr[..., 3]

    maxc = rgb.max(axis=-1)
    minc = rgb.min(axis=-1)
    v = maxc
    delta = maxc - minc
    s = np.where(maxc == 0, 0, delta / np.where(maxc == 0, 1, maxc))

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(v)
    mask_delta = delta > 1e-6
    rc = np.where(mask_delta, (maxc - r) / np.where(delta == 0, 1, delta), 0)
    gc = np.where(mask_delta, (maxc - g) / np.where(delta == 0, 1, delta), 0)
    bc = np.where(mask_delta, (maxc - b) / np.where(delta == 0, 1, delta), 0)
    h = np.where(r == maxc, bc - gc, h)
    h = np.where(g == maxc, 2.0 + rc - bc, h)
    h = np.where(b == maxc, 4.0 + gc - rc, h)
    h = (h / 6.0) % 1.0

    warm_mask = (h >= WARM_HUE_MIN) & (h <= WARM_HUE_MAX) & (s >= MIN_SATURATION)

    hue_frac = np.clip((h - WARM_HUE_MIN) / (WARM_HUE_MAX - WARM_HUE_MIN), 0, 1)
    new_h = TARGET_HUE_MIN + hue_frac * (TARGET_HUE_MAX - TARGET_HUE_MIN)
    h_out = np.where(warm_mask, new_h, h)

    i = np.floor(h_out * 6.0)
    f = h_out * 6.0 - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i_mod = i.astype(int) % 6

    r_out = np.select(
        [i_mod == 0, i_mod == 1, i_mod == 2, i_mod == 3, i_mod == 4, i_mod == 5],
        [v, q, p, p, t, v],
    )
    g_out = np.select(
        [i_mod == 0, i_mod == 1, i_mod == 2, i_mod == 3, i_mod == 4, i_mod == 5],
        [t, v, v, q, p, p],
    )
    b_out = np.select(
        [i_mod == 0, i_mod == 1, i_mod == 2, i_mod == 3, i_mod == 4, i_mod == 5],
        [p, p, t, v, v, q],
    )

    out_rgb = np.stack([r_out, g_out, b_out], axis=-1)
    out_rgb = np.clip(out_rgb * 255.0, 0, 255).astype(np.uint8)
    out_alpha = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    out = np.dstack([out_rgb, out_alpha])

    Image.fromarray(out, 'RGBA').save(path_out)
    print(f'OK: {path_out}')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('uso: python recolor-quiz-illustrations.py <in.png> <out.png>')
        sys.exit(1)
    recolor(sys.argv[1], sys.argv[2])
