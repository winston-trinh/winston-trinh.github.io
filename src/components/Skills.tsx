import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import styles from './Skills.module.css'

/** A number in [-1, 1] from a word, so each skill lands in the same spot on every visit. */
export function scatter(word: string, salt: number): number {
  let h = 2166136261 ^ salt
  for (const c of word) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return ((h >>> 0) % 2000) / 1000 - 1
}

/** `list` with the item at `from` moved to `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** Index of the spot nearest (x, y). */
export function nearest(spots: { x: number; y: number }[], x: number, y: number): number {
  let best = 0
  spots.forEach((s, i) => {
    if (Math.hypot(s.x - x, s.y - y) < Math.hypot(spots[best].x - x, spots[best].y - y)) best = i
  })
  return best
}

/** How far, in px, the pointer's pull reaches; how much the nearest pill grows; how far neighbours part. */
const REACH = 120
const SWELL = 0.3
const PART = 16
/** On touch, a pill is picked up after a short press, so a swipe still scrolls the page. */
const HOLD_MS = 260

interface Drag {
  pill: HTMLElement
  /** Where it sits in the order right now; it moves as the others make room. */
  index: number
  id: number
  touch: boolean
  /** Where the press started, and where the pointer is now. */
  x: number
  y: number
  px: number
  py: number
  /** Where in the pill it was grabbed, so it stays under the pointer as the others reflow. */
  grabX: number
  grabY: number
  armed: boolean
  dragging: boolean
  hold: number
  /** When the others last made room, so they don't jitter back and forth. */
  moved: number
  /** A second look once the pause is over, in case the pointer stopped while they waited. */
  recheck: number
}

/** A pill makes room only when the dragged one is clearly nearer its spot than its own, and not too often. */
const SNAP_MARGIN = 8
const REFLOW_MS = 140

/**
 * Skills scattered loosely across the page. Pointing at the cloud straightens
 * it, and the pills part around the pointer: the one under it swells and its
 * neighbours make room, like the Dock. Any pill can be dragged around inside
 * the cloud (on touch, after a short press); the others shuffle out of its way
 * as it moves, and let go, it settles into the gap they left.
 */
export function Skills({ skills }: { skills: string[] }) {
  const listRef = useRef<HTMLUListElement>(null)
  const frame = useRef(0)
  // Each pill's resting centre within the cloud, measured on the way in (transforms don't move it).
  const centres = useRef<{ pill: HTMLElement; x: number; y: number }[]>([])
  const drag = useRef<Drag | null>(null)
  // Where each pill was on screen just before the others made room, to slide them from there.
  const before = useRef<Map<string, DOMRect> | null>(null)
  const [order, setOrder] = useState(skills)
  const [spread, setSpread] = useState(false)

  const pills = () => [...(listRef.current?.children ?? [])] as HTMLElement[]

  const measure = () => {
    centres.current = pills().map((pill) => ({
      pill,
      x: pill.offsetLeft + pill.offsetWidth / 2,
      y: pill.offsetTop + pill.offsetHeight / 2,
    }))
  }

  const expand = () => {
    measure()
    setSpread(true)
  }

  const calm = () => {
    for (const pill of pills()) {
      for (const v of ['--s', '--ox', '--oy']) pill.style.removeProperty(v)
      delete pill.dataset.near
    }
  }

  const swell = (clientX: number, clientY: number) => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const box = listRef.current?.getBoundingClientRect()
      if (!box || drag.current?.dragging) return
      const px = clientX - box.left
      const py = clientY - box.top
      let near: HTMLElement | null = null
      let best = Infinity
      for (const { pill, x, y } of centres.current) {
        const d = Math.hypot(x - px, y - py)
        const pull = Math.max(0, 1 - d / REACH)
        // The pill under the pointer stays put; the ones around it are pushed away from it.
        const push = d > 0 ? (PART * pull * Math.min(1, d / 30)) / d : 0
        pill.style.setProperty('--s', (1 + SWELL * pull).toFixed(3))
        pill.style.setProperty('--ox', `${((x - px) * push).toFixed(1)}px`)
        pill.style.setProperty('--oy', `${((y - py) * push).toFixed(1)}px`)
        delete pill.dataset.near
        if (d < best) [best, near] = [d, pill]
      }
      if (near && best < 40) near.dataset.near = ''
    })
  }

  const settle = () => {
    cancelAnimationFrame(frame.current)
    calm()
    setSpread(false)
  }

  const startDrag = (d: Drag) => {
    d.dragging = true
    cancelAnimationFrame(frame.current)
    calm()
    d.pill.dataset.dragging = ''
    // Captured by the cloud, not the pill: the pill's node moves as the others reflow, which would drop it.
    listRef.current?.setPointerCapture?.(d.id)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    const pill = (e.target as Element).closest('li')
    const touch = e.pointerType === 'touch'
    if (touch) {
      if (!spread) expand()
      swell(e.clientX, e.clientY)
    }
    if (!pill || drag.current || (e.button !== 0 && !touch)) return
    const cloud = listRef.current!.getBoundingClientRect()
    const d: Drag = {
      pill,
      index: pills().indexOf(pill),
      id: e.pointerId,
      touch,
      x: e.clientX,
      y: e.clientY,
      px: e.clientX,
      py: e.clientY,
      grabX: e.clientX - cloud.left - pill.offsetLeft,
      grabY: e.clientY - cloud.top - pill.offsetTop,
      armed: !touch,
      dragging: false,
      hold: 0,
      moved: 0,
      recheck: 0,
    }
    if (touch) {
      d.hold = window.setTimeout(() => {
        d.armed = true
        startDrag(d)
      }, HOLD_MS)
    }
    drag.current = d
  }

  /** Keep the held pill under the pointer, wherever its resting spot is now, and inside the cloud. */
  const place = (d: Drag) => {
    const list = listRef.current!
    const cloud = list.getBoundingClientRect()
    const { offsetLeft: left, offsetTop: top, offsetWidth: w, offsetHeight: h } = d.pill
    const x = Math.min(Math.max(d.px - cloud.left - d.grabX, 0), list.clientWidth - w)
    const y = Math.min(Math.max(d.py - cloud.top - d.grabY, 0), list.clientHeight - h)
    d.pill.style.translate = `${x - left}px ${y - top}px`
    return { x: x + w / 2, y: y + h / 2 }
  }

  /** While a pill is held, the others shuffle over to leave a gap wherever it would land. */
  const makeRoom = (d: Drag, at: { x: number; y: number }) => {
    const now = performance.now()
    window.clearTimeout(d.recheck)
    if (now - d.moved < REFLOW_MS) {
      d.recheck = window.setTimeout(() => drag.current === d && makeRoom(d, place(d)), REFLOW_MS - (now - d.moved))
      return
    }
    const spots = pills().map((p) => ({ x: p.offsetLeft + p.offsetWidth / 2, y: p.offsetTop + p.offsetHeight / 2 }))
    const to = nearest(spots, at.x, at.y)
    const own = spots[d.index]
    const there = spots[to]
    if (to === d.index || Math.hypot(there.x - at.x, there.y - at.y) + SNAP_MARGIN > Math.hypot(own.x - at.x, own.y - at.y)) return
    d.moved = now
    before.current = new Map(pills().filter((p) => p !== d.pill).map((p) => [p.textContent ?? '', p.getBoundingClientRect()]))
    const from = d.index
    d.index = to
    setOrder((list) => moveItem(list, from, to))
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current
    if (d && e.pointerId === d.id) {
      d.px = e.clientX
      d.py = e.clientY
      if (!d.dragging) {
        const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y)
        // A touch that moves before the press is held is a scroll, not a drag.
        if (!d.armed) {
          if (moved > 8) cancelDrag()
          return
        }
        if (moved < 4) return
        startDrag(d)
      }
      makeRoom(d, place(d))
      return
    }
    if (e.pointerType !== 'touch') swell(e.clientX, e.clientY)
  }

  const cancelDrag = () => {
    const d = drag.current
    if (!d) return
    window.clearTimeout(d.hold)
    window.clearTimeout(d.recheck)
    drag.current = null
    if (d.dragging) {
      delete d.pill.dataset.dragging
      d.pill.style.translate = ''
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    window.clearTimeout(d.hold)
    window.clearTimeout(d.recheck)
    drag.current = null
    if (!d.dragging) return
    // Let go: it glides into the gap the others left for it.
    delete d.pill.dataset.dragging
    d.pill.style.translate = ''
    measure()
    // Let go outside the cloud with a mouse: settle it.
    const box = listRef.current!.getBoundingClientRect()
    const inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom
    if (!d.touch && !inside) settle()
  }

  // After the others make room, slide each from where it was to its new place,
  // and keep the held pill under the pointer at its new resting spot.
  useLayoutEffect(() => {
    const was = before.current
    if (!was) return
    before.current = null
    const held = drag.current?.dragging ? drag.current : null
    const others = pills().filter((p) => p !== held?.pill)
    for (const p of others) {
      p.style.transition = 'none'
      p.style.translate = ''
    }
    const now = others.map((p) => p.getBoundingClientRect())
    others.forEach((p, i) => {
      const old = was.get(p.textContent ?? '')
      if (old) p.style.translate = `${old.left - now[i].left}px ${old.top - now[i].top}px`
    })
    if (held) place(held)
    void listRef.current?.offsetWidth
    for (const p of others) {
      p.style.transition = ''
      p.style.translate = ''
    }
  }, [order])

  // Touch: a tap anywhere else settles the cloud again.
  useEffect(() => {
    if (!spread) return
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !listRef.current?.contains(e.target as Node)) settle()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [spread])

  // Once a pill is picked up on a touch screen, the finger moves it instead of scrolling the page.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const hold = (e: TouchEvent) => {
      if (drag.current?.armed && e.cancelable) e.preventDefault()
    }
    list.addEventListener('touchmove', hold, { passive: false })
    return () => {
      list.removeEventListener('touchmove', hold)
      cancelAnimationFrame(frame.current)
      window.clearTimeout(drag.current?.hold)
      window.clearTimeout(drag.current?.recheck)
    }
  }, [])

  return (
    <ul
      ref={listRef}
      className={styles.cloud}
      data-spread={spread || undefined}
      aria-label="Skills"
      onPointerEnter={(e) => e.pointerType !== 'touch' && expand()}
      onPointerMove={onPointerMove}
      onPointerLeave={(e) => e.pointerType !== 'touch' && !drag.current?.dragging && settle()}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={cancelDrag}
    >
      {order.map((s, i) => (
        <li
          key={s}
          className={styles.pill}
          style={
            {
              '--dx': `${(scatter(s, 1) * 8).toFixed(1)}px`,
              '--dy': `${(scatter(s, 2) * 10).toFixed(1)}px`,
              '--r': `${(scatter(s, 3) * 9).toFixed(1)}deg`,
              '--delay': `${(i % 8) * 18}ms`,
            } as CSSProperties
          }
        >
          {s}
        </li>
      ))}
    </ul>
  )
}
