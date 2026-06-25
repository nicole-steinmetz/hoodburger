#!/usr/bin/env python3
"""Batch-optimize hb-menu-*.jpg theme assets.

Resizes card images to 604px max (2x retina for 302px display) and recompresses
JPEGs. The menu hero keeps its dimensions but is recompressed more aggressively.

Requires: pip3 install Pillow

Usage:
  python3 scripts/optimize-menu-images.py           # optimize in place
  python3 scripts/optimize-menu-images.py --dry-run   # report only
"""
from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: pip3 install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

CARD_MAX_PX = 604
CARD_QUALITY = 82
HERO_FILENAME = "hb-menu-hero.jpg"
HERO_QUALITY = 78
MIN_SAVING_RATIO = 0.95


def optimize_image(data: bytes, *, max_px: int | None, quality: int) -> tuple[bytes, tuple[int, int]]:
    img = Image.open(io.BytesIO(data))
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    if max_px and max(img.size) > max_px:
        img.thumbnail((max_px, max_px), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
    return buf.getvalue(), img.size


def should_replace(original: bytes, optimized: bytes, original_size: tuple[int, int], max_px: int | None) -> bool:
    if max_px and max(original_size) > max_px:
        return True
    return len(optimized) < len(original) * MIN_SAVING_RATIO


def format_kb(num_bytes: int) -> str:
    return f"{num_bytes / 1024:.1f}KB"


def main() -> int:
    parser = argparse.ArgumentParser(description="Optimize hb-menu-*.jpg assets")
    parser.add_argument("--dry-run", action="store_true", help="Report savings without writing files")
    args = parser.parse_args()

    files = sorted(ASSETS.glob("hb-menu-*.jpg"))
    if not files:
        print(f"No menu images found in {ASSETS}")
        return 1

    total_before = 0
    total_after = 0
    changed = 0

    for path in files:
        original = path.read_bytes()
        total_before += len(original)

        with Image.open(io.BytesIO(original)) as img:
            original_dims = img.size

        if path.name == HERO_FILENAME:
            optimized, dims = optimize_image(original, max_px=None, quality=HERO_QUALITY)
            max_px = None
        else:
            optimized, dims = optimize_image(original, max_px=CARD_MAX_PX, quality=CARD_QUALITY)
            max_px = CARD_MAX_PX

        if should_replace(original, optimized, original_dims, max_px):
            total_after += len(optimized)
            changed += 1
            print(
                f"{'would optimize' if args.dry_run else 'optimized'} {path.name}: "
                f"{format_kb(len(original))} -> {format_kb(len(optimized))} "
                f"({original_dims[0]}x{original_dims[1]} -> {dims[0]}x{dims[1]})"
            )
            if not args.dry_run:
                path.write_bytes(optimized)
        else:
            total_after += len(original)
            print(f"skip {path.name}: already optimized ({format_kb(len(original))})")

    saved = total_before - total_after
    pct = (saved / total_before * 100) if total_before else 0
    print(
        f"\n{changed}/{len(files)} files "
        f"{'would change' if args.dry_run else 'changed'}; "
        f"{format_kb(total_before)} -> {format_kb(total_after)} "
        f"(saved {format_kb(saved)}, {pct:.0f}%)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
