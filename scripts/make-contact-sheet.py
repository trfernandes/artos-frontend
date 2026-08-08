from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw


def usage() -> None:
    print(
        "\n".join(
            [
                "Usage:",
                "  python make-contact-sheet.py <input-dir> <output.png>",
                "",
                "Input files:",
                "  viewport-001.png, viewport-002.png, ...",
            ]
        ),
        file=sys.stderr,
    )


def load_images(input_dir: Path) -> list[tuple[Path, Image.Image]]:
    files = sorted(input_dir.glob("viewport-*.png"))
    if not files:
        raise FileNotFoundError(f"No viewport-*.png files found in {input_dir}")

    return [(file, Image.open(file).convert("RGB")) for file in files]


def build_contact_sheet(images: list[tuple[Path, Image.Image]]) -> Image.Image:
    max_width = max(image.width for _, image in images)
    label_height = 34
    gutter = 12
    outer_padding = 16
    total_height = outer_padding

    for _, image in images:
        total_height += label_height + image.height + gutter

    canvas = Image.new("RGB", (max_width + outer_padding * 2, total_height), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y = outer_padding

    for index, (file, image) in enumerate(images, start=1):
        label = f"{index}. {file.name} - {image.width}x{image.height}"
        draw.rectangle(
            [outer_padding, y, outer_padding + max_width, y + label_height],
            fill=(239, 246, 255),
        )
        draw.text((outer_padding + 10, y + 9), label, fill=(31, 41, 55))
        y += label_height

        x = outer_padding + (max_width - image.width) // 2
        canvas.paste(image, (x, y))
        y += image.height + gutter

    return canvas


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        usage()
        return 1

    input_dir = Path(argv[1]).resolve()
    output_path = Path(argv[2]).resolve()

    if not input_dir.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    images = load_images(input_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sheet = build_contact_sheet(images)
    sheet.save(output_path)

    print(
        json.dumps(
            {
                "ok": True,
                "inputDir": str(input_dir),
                "output": str(output_path),
                "count": len(images),
                "size": list(sheet.size),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
