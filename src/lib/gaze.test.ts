import manifest from '../gaze/manifest.json'
import { allGazeSrcs, gazeSrc, GAZE_STEPS as S, pointerToGrid } from './gaze'

const rect = { left: 100, top: 100, width: 200, height: 200 }
// Eye line used by pointerToGrid: center x = 200, y = 100 + 200 * 0.45 = 190.
const cx = 200
const cy = 190

describe('pointerToGrid', () => {
  it('looks straight ahead when the pointer is on the eyes', () => {
    expect(pointerToGrid(cx, cy, rect)).toEqual({ px: 0, py: 0 })
  })

  it('clamps far-away pointers to the grid edge', () => {
    expect(pointerToGrid(5000, -5000, rect)).toEqual({ px: S, py: -S })
    expect(pointerToGrid(-5000, 5000, rect)).toEqual({ px: -S, py: S })
  })

  it('is symmetric around the face center', () => {
    const a = pointerToGrid(cx + 90, cy + 40, rect)
    const b = pointerToGrid(cx - 90, cy - 40, rect)
    expect(b).toEqual({ px: -a.px, py: -a.py })
  })

  it('scales with the reach distance', () => {
    expect(pointerToGrid(cx + 100, cy, rect, 200, 3)).toEqual({ px: 2, py: 0 })
    expect(pointerToGrid(cx + 100, cy, rect, 100, 3)).toEqual({ px: 3, py: 0 })
  })

  it('never returns negative zero', () => {
    const { px, py } = pointerToGrid(cx - 1, cy - 1, rect)
    expect(Object.is(px, -0)).toBe(false)
    expect(Object.is(py, -0)).toBe(false)
  })
})

describe('gazeSrc', () => {
  it('follows the naming pattern from the generator manifest', () => {
    expect(manifest.pattern).toBe('gaze_px{px}_py{py}.webp')
    expect(gazeSrc({ px: -S, py: 2 })).toBe(`/gaze/gaze_px-${S}_py2.webp`)
    expect(gazeSrc({ px: 0, py: 0 })).toBe('/gaze/gaze_px0_py0.webp')
  })

  it('lists one image per grid cell', () => {
    const srcs = allGazeSrcs()
    expect(srcs).toHaveLength((manifest.steps * 2 + 1) ** 2)
    expect(new Set(srcs).size).toBe(srcs.length)
  })
})
