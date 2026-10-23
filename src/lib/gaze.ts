import manifest from '../gaze/manifest.json'

export interface Gaze {
  px: number
  py: number
}

export interface FaceRect {
  left: number
  top: number
  width: number
  height: number
}

export const GAZE_STEPS: number = manifest.steps
export const CENTER: Gaze = { px: 0, py: 0 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Map a pointer position to the nearest gaze grid cell.
 * `reach` is the pointer distance (px) from the face center at which the eyes
 * hit the edge of the grid.
 */
export function pointerToGrid(
  x: number,
  y: number,
  rect: FaceRect,
  reach: number = Math.max(rect.width, rect.height),
  steps: number = GAZE_STEPS,
): Gaze {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height * 0.45 // eyes sit a little above the image center
  const nx = clamp((x - cx) / reach, -1, 1)
  const ny = clamp((y - cy) / reach, -1, 1)
  // `|| 0` turns -0 into 0 so cells compare and stringify cleanly.
  return { px: Math.round(nx * steps) || 0, py: Math.round(ny * steps) || 0 }
}

export function gazeSrc({ px, py }: Gaze, base = '/gaze/'): string {
  return base + manifest.pattern.replace('{px}', String(px)).replace('{py}', String(py))
}

export function allGazeSrcs(steps: number = GAZE_STEPS): string[] {
  const out: string[] = []
  for (let py = -steps; py <= steps; py++) {
    for (let px = -steps; px <= steps; px++) out.push(gazeSrc({ px, py }))
  }
  return out
}
