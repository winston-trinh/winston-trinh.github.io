import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'glass'
export const DEFAULT_TRANSLUCENCY = 0.5

/** Even fully "clear", glass keeps this much tint and frost so text on it stays readable. */
export const MIN_ALPHA = 0.3
export const MAX_ALPHA = 0.88
export const MIN_BLUR = 2
export const MAX_BLUR = 14

const clamp = (n: number) => Math.min(1, Math.max(0, n))

export function readTranslucency(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const n = raw === null ? NaN : Number(raw)
    return Number.isFinite(n) ? clamp(n) : DEFAULT_TRANSLUCENCY
  } catch {
    return DEFAULT_TRANSLUCENCY
  }
}

function saveTranslucency(v: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(v))
  } catch {
    // Unavailable storage only loses the saved value; the glass still changes.
  }
}

/**
 * Maps 0 (frosted) … 1 (clear) onto the glass tokens every Liquid Glass
 * surface reads: the tint's opacity and the frost behind it.
 */
export function applyTranslucency(t: number, root: HTMLElement = document.documentElement) {
  const v = clamp(t)
  root.style.setProperty('--glass-alpha', (MAX_ALPHA - (MAX_ALPHA - MIN_ALPHA) * v).toFixed(3))
  root.style.setProperty('--lg-blur', `${(MIN_BLUR + (MAX_BLUR - MIN_BLUR) * (1 - v)).toFixed(1)}px`)
  root.dataset.translucency = v.toFixed(2)
}

/**
 * Translucency for the hero slider. Dragging must track 1:1, so nothing here
 * renders React: the CSS variables are written at most once per frame, straight
 * to <html>, and the value is saved only once the drag settles.
 */
export function useGlass() {
  const [initial] = useState(readTranslucency)
  const frame = useRef(0)
  const save = useRef<ReturnType<typeof setTimeout>>()
  const pending = useRef(initial)

  useEffect(() => {
    applyTranslucency(pending.current)
    return () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(save.current)
    }
  }, [])

  const setTranslucency = useCallback((t: number) => {
    pending.current = clamp(t)
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        applyTranslucency(pending.current)
      })
    }
    clearTimeout(save.current)
    save.current = setTimeout(() => saveTranslucency(pending.current), 250)
  }, [])

  return { initial, setTranslucency }
}
