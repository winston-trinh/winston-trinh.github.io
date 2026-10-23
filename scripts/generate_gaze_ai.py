#!/usr/bin/env python3
"""Generate realistic gaze images with Replicate's fofr/expression-editor model.

Each grid cell asks the model to move the pupils toward a direction, turn the
head slightly with them, and add small, natural expression changes (brow lift
when looking up, a touch more or less smile, a little head tilt). The output
uses the same file names and manifest as scripts/generate_gaze.py, so the site
picks the new images up without code changes.

Usage:
    export REPLICATE_API_TOKEN=r8_...
    python3 scripts/generate_gaze_ai.py            # 7x7 grid (49 predictions)
    python3 scripts/generate_gaze_ai.py --steps 5  # 11x11 grid (121 predictions)
    python3 scripts/generate_gaze_ai.py --flip-y   # if up/down come out inverted

Images that already exist are skipped; pass --force to regenerate them.
Uses only the standard library plus Pillow (already used by generate_gaze.py).
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import math
import os
import random
import ssl
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "references" / "portrait.jpg"
OUT_DIR = ROOT / "public" / "gaze"
MANIFEST = ROOT / "src" / "gaze" / "manifest.json"
DEBUG_DIR = ROOT / "scripts" / "debug"

MODEL_VERSION = "bf913bc90e1c44ba288ba3942a538693b72e8cc7df576f3beebe56adc0a92b86"
API = "https://api.replicate.com/v1/predictions"


def ssl_context() -> ssl.SSLContext:
    """Verified TLS context that also works on python.org macOS builds, which ship without CA certs."""
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    ctx = ssl.create_default_context()
    if not ctx.get_ca_certs() and Path("/etc/ssl/cert.pem").exists():
        ctx.load_verify_locations("/etc/ssl/cert.pem")
    return ctx


SSL = ssl_context()

# Head-and-shoulders square crop of the full-resolution portrait (same framing as generate_gaze.py).
CROP = (750, 1450, 4150, 4850)
UPLOAD_SIZE = 1024
OUT_SIZE = 640
QUALITY = 82

# Motion ranges, kept small so the result stays believable.
MAX_PUPIL = 15.0  # model range is about ±15
MAX_YAW = 8.0  # degrees of head turn at the grid edge
MAX_PITCH = 6.0
MAX_ROLL = 1.5
SMILE_JITTER = 0.12  # model smile delta; the photo is already smiling
BROW_LIFT = 4.0  # eyebrow raise when looking up


def cell_inputs(px: int, py: int, steps: int, flip_y: bool) -> dict:
    """Model inputs for one grid cell. +px = viewer's right, +py = down."""
    nx, ny = px / steps, py / steps
    if flip_y:
        ny = -ny
    # Deterministic per-cell jitter so reruns produce matching images.
    rng = random.Random(f"{px},{py}")
    # The resting (center) frame stays true to the original photo.
    jitter = 0.0 if px == py == 0 else 1.0
    up = max(0.0, -ny)
    return {
        "pupil_x": round(nx * MAX_PUPIL, 2),
        "pupil_y": round(-ny * MAX_PUPIL, 2) + 0.0,  # model: positive = looking up
        "rotate_yaw": round(nx * MAX_YAW, 2),
        "rotate_pitch": round(ny * MAX_PITCH, 2),
        "rotate_roll": round(-nx * MAX_ROLL * 0.6 + rng.uniform(-0.4, 0.4) * MAX_ROLL * jitter, 2),
        "eyebrow": round(up * BROW_LIFT + rng.uniform(-0.8, 0.8) * jitter, 2),
        "smile": round(rng.uniform(-SMILE_JITTER, SMILE_JITTER) * jitter - 0.05 * math.hypot(nx, ny), 3),
        "output_format": "webp",
        "output_quality": 95,
    }


def source_data_uri() -> str:
    img = Image.open(SRC).convert("RGB").crop(CROP).resize((UPLOAD_SIZE, UPLOAD_SIZE), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def request(method: str, url: str, token: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        url,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "wait=60",
        },
    )
    with urllib.request.urlopen(req, timeout=120, context=SSL) as res:
        return json.load(res)


def predict(token: str, image: str, inputs: dict, retries: int = 8) -> bytes:
    for attempt in range(retries):
        try:
            pred = request("POST", API, token, {"version": MODEL_VERSION, "input": {"image": image, **inputs}})
            while pred["status"] in ("starting", "processing"):
                time.sleep(1.5)
                pred = request("GET", pred["urls"]["get"], token)
            if pred["status"] != "succeeded":
                raise RuntimeError(f"prediction {pred['status']}: {pred.get('error')}")
            output = pred["output"]
            url = output[0] if isinstance(output, list) else output
            with urllib.request.urlopen(url, timeout=120, context=SSL) as res:
                return res.read()
        except urllib.error.HTTPError as e:
            if e.code in (401, 402, 403, 422):
                raise RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')}") from e
            # Low-credit accounts are throttled hard; honor Retry-After when given.
            retry_after = e.headers.get("Retry-After") if e.headers else None
            wait = float(retry_after) + 1 if retry_after else min(60, 2 ** attempt * (5 if e.code == 429 else 1))
            print(f"  HTTP {e.code}, retrying in {wait}s", file=sys.stderr)
            time.sleep(wait)
        except (urllib.error.URLError, TimeoutError) as e:
            print(f"  {e}, retrying", file=sys.stderr)
            time.sleep(2 ** attempt)
    raise RuntimeError("prediction failed after retries")


def save(data: bytes, path: Path) -> Image.Image:
    img = Image.open(io.BytesIO(data)).convert("RGB")
    if img.size != (OUT_SIZE, OUT_SIZE):
        side = min(img.size)
        left, top = (img.width - side) // 2, (img.height - side) // 2
        img = img.crop((left, top, left + side, top + side)).resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    img.save(path, quality=QUALITY, method=6)
    return img


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=3, help="cells per side = 2*steps+1 (default 3 -> 7x7)")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--force", action="store_true", help="regenerate images that already exist")
    parser.add_argument("--flip-y", action="store_true", help="invert vertical direction")
    parser.add_argument("--dry-run", action="store_true", help="print the inputs per cell and exit")
    args = parser.parse_args()

    steps = args.steps
    cells = [(px, py) for py in range(-steps, steps + 1) for px in range(-steps, steps + 1)]

    if args.dry_run:
        for px, py in cells:
            print(f"px={px:+d} py={py:+d}", cell_inputs(px, py, steps, args.flip_y))
        return

    token = os.environ.get("REPLICATE_API_TOKEN")
    if not token:
        sys.exit("Set REPLICATE_API_TOKEN first (https://replicate.com/account/api-tokens).")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if args.force:
        # Remove frames from a different grid size too, so the folder matches the manifest.
        for old in OUT_DIR.glob("gaze_*.webp"):
            old.unlink()
    path_for = lambda px, py: OUT_DIR / f"gaze_px{px}_py{py}.webp"
    todo = [c for c in cells if args.force or not path_for(*c).exists()]
    print(f"{len(cells)} cells, {len(todo)} to generate")

    image = source_data_uri()
    failures: list[tuple[int, int]] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(predict, token, image, cell_inputs(px, py, steps, args.flip_y)): (px, py) for px, py in todo}
        for i, fut in enumerate(as_completed(futures), 1):
            px, py = futures[fut]
            try:
                save(fut.result(), path_for(px, py))
                print(f"[{i}/{len(todo)}] px={px} py={py}")
            except Exception as e:  # keep going; rerun picks up the gaps
                failures.append((px, py))
                print(f"[{i}/{len(todo)}] px={px} py={py} FAILED: {e}", file=sys.stderr)

    if failures:
        sys.exit(f"{len(failures)} cells failed; rerun the same command to fill them in.")

    MANIFEST.write_text(
        json.dumps({"steps": steps, "size": OUT_SIZE, "pattern": "gaze_px{px}_py{py}.webp"}, indent=2) + "\n"
    )

    # Contact sheet of the 3x3 corners/edges/center for a quick visual check.
    DEBUG_DIR.mkdir(exist_ok=True)
    thumb = 256
    sheet = Image.new("RGB", (thumb * 3, thumb * 3), "white")
    for i, (px, py) in enumerate((x, y) for y in (-steps, 0, steps) for x in (-steps, 0, steps)):
        sheet.paste(Image.open(path_for(px, py)).resize((thumb, thumb)), ((i % 3) * thumb, (i // 3) * thumb))
    sheet.save(DEBUG_DIR / "ai_contact_sheet.png")
    print(f"Done. Check {(DEBUG_DIR / 'ai_contact_sheet.png').relative_to(ROOT)}: top row should look up, left column left.")


if __name__ == "__main__":
    main()
