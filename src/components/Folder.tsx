import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Reveal } from './Reveal'
import styles from './Folder.module.css'

export { styles as folderStyles }

/** One sheet in a folder: what rises out of it, and what the flap shows while it's chosen. */
export interface FolderFile {
  name: string
  /** Face of the sheet: a screenshot, a document. */
  sheet: ReactNode
  /** Label pinned to the sheet once the folder opens. */
  caption?: string
  details: ReactNode
}

export interface FolderData {
  /** Unique name, read out as the folder's label: "October 2023", "AT&T". */
  name: string
  /** What the closed flap shows. */
  cover: ReactNode
  /** In order: the first sits in front and rises least, the last at the back and highest. */
  files: FolderFile[]
}

interface FolderProps {
  folder: FolderData
  open: boolean
  onToggle: () => void
  onOpen: () => void
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/** How long a sheet takes to travel from its place in the stack to the front. */
const SHUFFLE_MS = 560

/** Where an open folder holds the sheet in stack slot `i`, as in Folder.module.css: x and y in % of the sheet, r in degrees. */
const held = (i: number) => ({ x: 3 + i * 9, y: -96 - i * 46, r: i * 4 - 2 })

/**
 * The shuffle as one continuous arc: out to the side and a little up, then in
 * to the front, passing in front of the other sheets halfway. Sampled finely so
 * the path curves rather than bending at a corner; the easing covers the whole trip.
 */
function shuffleFrames(from: number): Keyframe[] {
  const a = held(from)
  const b = held(0)
  const steps = 16
  return Array.from({ length: steps + 1 }, (_, k) => {
    const s = k / steps
    const bow = Math.sin(Math.PI * s)
    const x = a.x + (b.x - a.x) * s + 52 * bow
    const y = a.y + (b.y - a.y) * s - 18 * bow
    const r = a.r + (b.r - a.r) * s + 7 * bow
    return { offset: s, transform: `translate(${x}%, ${y}%) rotate(${r}deg)`, zIndex: s < 0.5 ? 12 - from : 13 }
  })
}

/**
 * A folder that opens on hover (or tap). Its sheets rise out of it, stacking
 * upward and drifting slightly right like a Downloads stack fanning out of the
 * Dock, and the glass flap shows the chosen sheet's details. Clicking a sheet
 * further back sweeps it around the stack to the front; closing the folder puts
 * the stack back in its original order.
 */
function Folder({ folder, open, onToggle, onOpen }: FolderProps) {
  const { name, cover, files } = folder
  // Hovering previews a sheet; clicking pins it, shuffled to the front, until another is clicked.
  const [preview, setPreview] = useState(0)
  const [pinned, setPinned] = useState<number | null>(null)
  // The sheet on its way to the front, and the slot it left.
  const [shuffle, setShuffle] = useState<{ index: number; from: number } | null>(null)
  const sheetRefs = useRef<(HTMLElement | null)[]>([])
  const many = files.length > 1
  const infoId = `folder-${slug(name)}`
  const selected = pinned ?? preview
  const current = files[selected]

  /** Place in the stack: 0 is the front. The pinned sheet moves to 0 and the rest keep their order behind it. */
  const slot = (i: number) => (pinned === null ? i : i === pinned ? 0 : i < pinned ? i + 1 : i)

  // Closed (by a click on the background, another folder, or the flap): unpin and restore the order.
  useEffect(() => {
    if (open) return
    setShuffle(null)
    setPinned(null)
    setPreview(0)
  }, [open])

  // Run the arc once the sheet's new slot is in the DOM, before the browser paints it there.
  useLayoutEffect(() => {
    const el = shuffle && sheetRefs.current[shuffle.index]
    if (!shuffle || !el?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // The arc replaces the slot transition, so the two can't fight at the end.
    el.style.transition = 'none'
    const run = el.animate(shuffleFrames(shuffle.from), { duration: SHUFFLE_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' })
    const done = () => {
      el.style.transition = ''
      setShuffle(null)
    }
    run.onfinish = done
    return () => {
      run.cancel()
      el.style.transition = ''
    }
  }, [shuffle])

  const choose = (i: number) => {
    onOpen()
    const from = slot(i)
    setPinned(i)
    if (from > 0) setShuffle({ index: i, from })
  }

  return (
    <article className={styles.folder} data-open={open || undefined} data-folder={name} data-count={files.length} aria-label={name}>
      <div className={styles.stage}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={infoId}
          aria-label={`${open ? 'Close' : 'Open'} the ${name} folder (${files.map((f) => f.name).join(', ')})`}
          onClick={onToggle}
        />
        <div className={styles.back} aria-hidden="true" />
        {files.map((f, i) => {
          const style = { '--i': slot(i) } as CSSProperties
          const face = (
            <>
              {f.sheet}
              {f.caption && <span className={styles.caption}>{f.caption}</span>}
            </>
          )
          return many ? (
            <button
              key={f.name}
              ref={(el) => {
                sheetRefs.current[i] = el
              }}
              type="button"
              className={styles.pic}
              style={style}
              data-slot={slot(i)}
              data-selected={i === selected || undefined}
              data-shuffling={shuffle?.index === i || undefined}
              aria-label={`Show ${f.name}`}
              aria-pressed={i === selected}
              onPointerEnter={() => !open && setPreview(i)}
              onFocus={() => !open && setPreview(i)}
              onClick={() => choose(i)}
            >
              {face}
            </button>
          ) : (
            <div key={f.name} className={styles.pic} style={style} data-slot={0} data-selected aria-hidden="true">
              {face}
            </div>
          )
        })}
        <div className={styles.front}>
          <div className={styles.cover}>{cover}</div>
          <div id={infoId} className={styles.info}>
            <div key={current.name} className={styles.details}>
              {current.details}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/** A grid of folders where at most one is open at a time. */
export function FolderGrid({ folders, className }: { folders: FolderData[]; className?: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // A click anywhere outside the open folder (the page background, another folder) puts it away.
  useEffect(() => {
    if (open === null) return
    const onDown = (e: PointerEvent) => {
      const folder = gridRef.current?.querySelector(`[data-folder="${CSS.escape(open)}"]`)
      if (!folder?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div ref={gridRef} className={`${styles.grid}${className ? ` ${className}` : ''}`}>
      {folders.map((f, i) => (
        <Reveal key={f.name} delay={(i % 2) * 80}>
          <Folder
            folder={f}
            open={open === f.name}
            onToggle={() => setOpen((cur) => (cur === f.name ? null : f.name))}
            onOpen={() => setOpen(f.name)}
          />
        </Reveal>
      ))}
    </div>
  )
}
