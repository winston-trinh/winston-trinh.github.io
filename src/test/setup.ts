import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

type Listener = (e: MediaQueryListEvent) => void

/** Controllable matchMedia mock: set `mediaMatches[query] = true` before render. */
export const mediaMatches: Record<string, boolean> = {}
const listeners = new Map<string, Set<Listener>>()

export function setMedia(query: string, matches: boolean) {
  mediaMatches[query] = matches
  listeners.get(query)?.forEach((l) => l({ matches } as MediaQueryListEvent))
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    get matches() {
      return !!mediaMatches[query]
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, l: Listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set())
      listeners.get(query)!.add(l)
    },
    removeEventListener: (_: string, l: Listener) => listeners.get(query)?.delete(l),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  cleanup()
  for (const k of Object.keys(mediaMatches)) delete mediaMatches[k]
  listeners.clear()
  localStorage.clear()
  delete document.documentElement.dataset.theme
  vi.restoreAllMocks()
})

// jsdom lacks PointerEvent; without it fireEvent.pointerMove drops clientX/clientY.
if (!('PointerEvent' in window)) {
  class PointerEventPolyfill extends MouseEvent {
    pointerType: string
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerType = init.pointerType ?? 'mouse'
    }
  }
  Object.defineProperty(window, 'PointerEvent', { writable: true, value: PointerEventPolyfill })
}

// glisse fits its glass with ResizeObserver and paints rims on a 2D canvas; jsdom has neither.
if (!('ResizeObserver' in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverStub })
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: ResizeObserverStub })
}
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext']
for (const name of ['setPointerCapture', 'releasePointerCapture'] as const) {
  if (!Element.prototype[name]) Element.prototype[name] = () => {}
}
if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
