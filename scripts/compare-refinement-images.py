from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


def usage() -> None:
    print(
        "\n".join(
            [
                "Uso:",
                "  python compare-refinement-images.py <reference.png> <actual.png> <output-dir>",
                "",
                "Saidas:",
                "  - diff-overlay.png",
                "  - side-by-side.png",
                "  - metrics.json",
            ]
        ),
        file=sys.stderr,
    )


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def fit_to_reference(actual: Image.Image, ref_size: tuple[int, int]) -> Image.Image:
    if actual.size == ref_size:
        return actual
    return actual.resize(ref_size, Image.Resampling.LANCZOS)


def compute_metrics(reference: Image.Image, actual: Image.Image) -> dict[str, float | int | None]:
    diff = ImageChops.difference(reference, actual)
    hist = diff.histogram()
    sq = 0.0
    total = 0.0
    pixel_count = reference.size[0] * reference.size[1] * 3

    for idx, count in enumerate(hist):
        value = idx % 256
        sq += (value * value) * count
        total += value * count

    rmse = math.sqrt(sq / pixel_count)
    mae = total / pixel_count

    grayscale = diff.convert("L")
    pixels = grayscale.load()
    nonzero = 0
    for y in range(reference.size[1]):
        for x in range(reference.size[0]):
            if pixels[x, y] > 12:
                nonzero += 1
    changed_ratio = nonzero / (reference.size[0] * reference.size[1])
    bbox = grayscale.point(lambda p: 255 if p > 12 else 0).getbbox()

    return {
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "changed_pixels": nonzero,
        "changed_ratio": round(changed_ratio, 6),
        "bbox_left": bbox[0] if bbox else None,
        "bbox_top": bbox[1] if bbox else None,
        "bbox_right": bbox[2] if bbox else None,
        "bbox_bottom": bbox[3] if bbox else None,
    }


def build_overlay(reference: Image.Image, actual: Image.Image) -> Image.Image:
    diff = ImageChops.difference(reference, actual).convert("L")
    heat = Image.new("RGBA", reference.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(heat)
    pixels = diff.load()
    width, height = reference.size

    for y in range(height):
        for x in range(width):
            value = pixels[x, y]
            if value <= 12:
                continue
            alpha = min(220, 45 + value)
            draw.point((x, y), fill=(255, 64, 64, alpha))

    return Image.alpha_composite(reference.convert("RGBA"), heat)


def build_side_by_side(reference: Image.Image, actual: Image.Image, overlay: Image.Image) -> Image.Image:
    width, height = reference.size
    canvas = Image.new("RGB", (width * 3, height), (255, 255, 255))
    canvas.paste(reference, (0, 0))
    canvas.paste(actual, (width, 0))
    canvas.paste(overlay.convert("RGB"), (width * 2, 0))
    return canvas


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        usage()
        return 1

    reference_path = Path(argv[1]).resolve()
    actual_path = Path(argv[2]).resolve()
    output_dir = Path(argv[3]).resolve()

    if not reference_path.exists():
        raise FileNotFoundError(f"Imagem de referencia nao encontrada: {reference_path}")
    if not actual_path.exists():
        raise FileNotFoundError(f"Screenshot atual nao encontrado: {actual_path}")

    output_dir.mkdir(parents=True, exist_ok=True)

    reference = load_rgb(reference_path)
    actual = fit_to_reference(load_rgb(actual_path), reference.size)
    overlay = build_overlay(reference, actual)
    side_by_side = build_side_by_side(reference, actual, overlay)
    metrics = compute_metrics(reference, actual)

    overlay_path = output_dir / "diff-overlay.png"
    side_by_side_path = output_dir / "side-by-side.png"
    metrics_path = output_dir / "metrics.json"

    overlay.save(overlay_path)
    side_by_side.save(side_by_side_path)
    metrics_path.write_text(
        json.dumps(
            {
                "reference": str(reference_path),
                "actual": str(actual_path),
                "overlay": str(overlay_path),
                "side_by_side": str(side_by_side_path),
                **metrics,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "ok": True,
                "reference": str(reference_path),
                "actual": str(actual_path),
                "overlay": str(overlay_path),
                "side_by_side": str(side_by_side_path),
                **metrics,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
