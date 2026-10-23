#!/usr/bin/env python3
"""Generate a grid of gaze images from references/portrait.jpg.

Each output image moves both irises inside their eye openings so the face
appears to look in a different direction. The frontend picks the image whose
grid cell matches the pointer direction.

Usage:
    python3 scripts/generate_gaze.py [--debug]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "references" / "portrait.jpg"
OUT_DIR = ROOT / "public" / "gaze"
MANIFEST = ROOT / "src" / "gaze" / "manifest.json"

# Square crop of the head and shoulders (full-resolution pixels).
CROP = (750, 1450, 4150, 4850)
OUT_SIZE = 640
QUALITY = 82

# Grid of directions: px/py in [-STEPS, STEPS]; +px = right, +py = down.
STEPS = 3
MAX_DX = 50  # full-res pixels of horizontal iris travel at the edge cells
MAX_DY = 12  # vertical travel is small because the smile narrows the eyes

# Eye geometry measured on the full-resolution portrait ("left" = viewer's left).
EYES = [
    {
        "center": (2030, 3229),
        "radius": 70,
        "aperture": [
            (1880, 3236), (1920, 3211), (1960, 3196), (2000, 3190), (2040, 3190),
            (2080, 3193), (2110, 3204), (2140, 3224), (2165, 3250),
            (2140, 3262), (2100, 3268), (2060, 3272), (2000, 3272),
            (1960, 3268), (1920, 3262), (1890, 3250),
        ],
    },
    {
        "center": (2786, 3248),
        "radius": 66,
        "aperture": [
            (2605, 3250), (2630, 3238), (2660, 3226), (2700, 3218), (2740, 3215),
            (2780, 3215), (2820, 3218), (2860, 3228), (2890, 3245), (2910, 3262),
            (2880, 3272), (2840, 3280), (2800, 3282), (2760, 3282),
            (2720, 3278), (2680, 3270), (2640, 3262), (2615, 3256),
        ],
    },
]

PAD = 40  # working margin around each eye's bounding box


def polygon_mask(size: tuple[int, int], points, offset) -> np.ndarray:
    m = Image.new("L", size, 0)
    ox, oy = offset
    ImageDraw.Draw(m).polygon([(x - ox, y - oy) for x, y in points], fill=255)
    return np.asarray(m, dtype=np.float32) / 255.0


def circle_mask(size: tuple[int, int], center, radius, feather: float = 0.0) -> np.ndarray:
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.hypot(xx - center[0], yy - center[1])
    if feather <= 0:
        return (d <= radius).astype(np.float32)
    return np.clip((radius - d) / feather + 0.5, 0.0, 1.0)


def blur(mask: np.ndarray, radius: float) -> np.ndarray:
    img = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255.0


def shift(arr: np.ndarray, dx: int, dy: int) -> np.ndarray:
    """Translate an array by (dx, dy), filling exposed edges with zeros."""
    out = np.zeros_like(arr)
    h, w = arr.shape[:2]
    xs, xd = (0, dx) if dx >= 0 else (-dx, 0)
    ys, yd = (0, dy) if dy >= 0 else (-dy, 0)
    out[yd:h - ys, xd:w - xs] = arr[ys:h - yd, xs:w - xd]
    return out


class Eye:
    """Pre-computed layers for one eye: empty socket + a movable iris."""

    def __init__(self, image: np.ndarray, spec: dict):
        xs = [p[0] for p in spec["aperture"]]
        ys = [p[1] for p in spec["aperture"]]
        self.box = (min(xs) - PAD, min(ys) - PAD, max(xs) + PAD, max(ys) + PAD)
        x0, y0, x1, y1 = self.box
        size = (x1 - x0, y1 - y0)
        region = image[y0:y1, x0:x1].astype(np.float32)
        cx, cy = spec["center"][0] - x0, spec["center"][1] - y0
        r = spec["radius"]

        self.aperture = polygon_mask(size, spec["aperture"], (x0, y0))
        self.aperture_soft = blur(self.aperture, 2.0)
        iris_hard = circle_mask(size, (cx, cy), r + 3)

        # 1. Empty socket: fill the iris area row by row, interpolating between
        #    the sclera on either side, then shade toward the upper lid.
        socket = region.copy()
        hole = (iris_hard > 0) & (self.aperture > 0)
        for y in range(size[1]):
            row_hole = np.where(hole[y])[0]
            if row_hole.size == 0:
                continue
            inside = np.where(self.aperture[y] > 0)[0]
            left = inside[inside < row_hole.min()]
            right = inside[inside > row_hole.max()]
            lc = region[y, left[-6:]].mean(axis=0) if left.size else None
            rc = region[y, right[:6]].mean(axis=0) if right.size else None
            if lc is None and rc is None:
                continue
            lc = rc if lc is None else lc
            rc = lc if rc is None else rc
            a, b = row_hole.min(), row_hole.max()
            t = np.linspace(0.0, 1.0, b - a + 1)[:, None]
            socket[y, a:b + 1] = lc * (1 - t) + rc * t
        # Smooth the fill and add a soft shadow cast by the upper lid.
        smooth = np.asarray(
            Image.fromarray(np.clip(socket, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)),
            dtype=np.float32,
        )
        hole_soft = blur(hole.astype(np.float32), 2.0)[..., None]
        socket = socket * (1 - hole_soft) + smooth * hole_soft
        lid_shadow = 1.0 - 0.35 * (1.0 - blur(shift(self.aperture, 0, 14), 6.0))
        socket = socket * np.where(self.aperture[..., None] > 0, lid_shadow[..., None], 1.0)
        self.socket = socket

        # 2. Iris patch: original pixels where the iris is visible; elsewhere in
        #    the disc (hidden under the lids) use the dark iris rim color so it
        #    can slide under the lids without dragging skin along.
        visible = (iris_hard > 0) & (self.aperture > 0)
        rim = visible & (circle_mask(size, (cx, cy), r - 12) == 0)
        rim_color = np.median(region[rim], axis=0)
        iris = np.where(visible[..., None], region, rim_color)
        self.iris = iris
        self.iris_alpha = circle_mask(size, (cx, cy), r, feather=3.0)
        self.region = region

    def render(self, dx: int, dy: int) -> np.ndarray:
        iris = shift(self.iris, dx, dy)
        alpha = shift(self.iris_alpha, dx, dy)[..., None]
        eye = self.socket * (1 - alpha) + iris * alpha
        m = self.aperture_soft[..., None]
        return self.region * (1 - m) + eye * m


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--debug", action="store_true", help="write geometry overlay + contact sheet")
    args = parser.parse_args()

    base = np.asarray(Image.open(SRC).convert("RGB"))
    eyes = [Eye(base, spec) for spec in EYES]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("gaze_*.webp"):
        old.unlink()

    frames: dict[tuple[int, int], Image.Image] = {}
    for py in range(-STEPS, STEPS + 1):
        for px in range(-STEPS, STEPS + 1):
            dx = round(px / STEPS * MAX_DX)
            dy = round(py / STEPS * MAX_DY)
            work = base.copy()
            for eye in eyes:
                x0, y0, x1, y1 = eye.box
                work[y0:y1, x0:x1] = np.clip(eye.render(dx, dy), 0, 255).astype(np.uint8)
            frame = Image.fromarray(work).crop(CROP).resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
            frame.save(OUT_DIR / f"gaze_px{px}_py{py}.webp", quality=QUALITY, method=6)
            frames[(px, py)] = frame

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps({"steps": STEPS, "size": OUT_SIZE, "pattern": "gaze_px{px}_py{py}.webp"}, indent=2) + "\n"
    )
    print(f"Wrote {len(frames)} images to {OUT_DIR.relative_to(ROOT)}")

    if args.debug:
        debug_dir = ROOT / "scripts" / "debug"
        debug_dir.mkdir(exist_ok=True)
        overlay = Image.fromarray(base).crop((1800, 3100, 3000, 3350))
        d = ImageDraw.Draw(overlay)
        for spec in EYES:
            pts = [(x - 1800, y - 3100) for x, y in spec["aperture"]]
            d.polygon(pts, outline=(255, 0, 0))
            cx, cy = spec["center"][0] - 1800, spec["center"][1] - 3100
            r = spec["radius"]
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(0, 255, 0))
        overlay.save(debug_dir / "geometry.png")

        # Contact sheet of eye strips for the 3x3 corners/edges/center.
        strip_box = (195, 312, 425, 362)  # eye band in the 640px output
        picks = [(px, py) for py in (-STEPS, 0, STEPS) for px in (-STEPS, 0, STEPS)]
        sw, sh = (strip_box[2] - strip_box[0]) * 2, (strip_box[3] - strip_box[1]) * 2
        sheet = Image.new("RGB", (sw * 3, sh * 3), "white")
        for i, key in enumerate(picks):
            strip = frames[key].crop(strip_box).resize((sw, sh), Image.LANCZOS)
            sheet.paste(strip, ((i % 3) * sw, (i // 3) * sh))
        sheet.save(debug_dir / "contact_sheet.png")
        print(f"Debug images in {debug_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
