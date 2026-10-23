import { useEffect, useState, type RefObject } from 'react'
import { CENTER, pointerToGrid, type Gaze } from '../lib/gaze'
import { useMediaQuery } from './useMediaQuery'

/** Track the pointer (mouse, pen or touch) and return the gaze cell toward it. */
export function useGaze(ref: RefObject<HTMLElement>): Gaze {
  const [gaze, setGaze] = useState<Gaze>(CENTER)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (reduceMotion) {
      setGaze(CENTER)
      return
    }
    let frame = 0
    let scheduled = false
    let last: { x: number; y: number } | null = null

    const update = () => {
      scheduled = false
      const el = ref.current
      if (!el || !last) return
      const next = pointerToGrid(last.x, last.y, el.getBoundingClientRect())
      setGaze((prev) => (prev.px === next.px && prev.py === next.py ? prev : next))
    }
    const onPointer = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
      if (scheduled) return
      scheduled = true
      frame = requestAnimationFrame(update)
    }
    const onLeave = () => {
      last = null
      setGaze(CENTER)
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [ref, reduceMotion])

  return gaze
}
