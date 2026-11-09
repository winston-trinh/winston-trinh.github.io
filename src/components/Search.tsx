import { SearchField } from 'glisse'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { scrollToSection } from '../lib/scrollToSection'
import { buildIndex, search, type SearchEntry } from '../lib/searchIndex'
import { complete, correct, vocabulary } from '../lib/suggest'
import styles from './Search.module.css'

const SUGGESTIONS = ['Experience', 'Education', 'Projects', 'Skills', 'Contact']

const isExternal = (href: string) => /^https?:/.test(href) || href.endsWith('.pdf')

const RECENTS_KEY = 'recent-searches'
const MAX_RECENTS = 5

/** Past searches for this browser session only. */
function readRecents(): string[] {
  try {
    const list = JSON.parse(sessionStorage.getItem(RECENTS_KEY) ?? '[]')
    return Array.isArray(list) ? list.filter((q): q is string => typeof q === 'string').slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

function writeRecents(list: string[]) {
  try {
    if (list.length) sessionStorage.setItem(RECENTS_KEY, JSON.stringify(list))
    else sessionStorage.removeItem(RECENTS_KEY)
  } catch {
    // Recents are a convenience; search works without them.
  }
}

/** Same-page anchor ('#about', or '/#about' while on the homepage) → its element id. */
function samePageTarget(href: string | undefined): string | null {
  if (!href) return null
  const url = new URL(href, window.location.href)
  if (!url.hash || url.origin !== window.location.origin || url.pathname !== window.location.pathname) return null
  return decodeURIComponent(url.hash.slice(1))
}

/** Width of `text` in the field's font. */
function measure(input: HTMLInputElement, text: string): number {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return 0
  const cs = getComputedStyle(input)
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const hint = matchMedia('(hover: none)').matches ? 0 : 48 // the "tab" key hint (hidden on touch screens)
  return ctx.measureText(text).width + hint
}

/**
 * The floating Liquid Glass search: focusing it blurs the page behind instant results.
 * `onOpenChange` hears when it opens and closes, so the nav can stop marking a section.
 */
export function Search({ home = '', onOpenChange }: { home?: string; onOpenChange?: (open: boolean) => void }) {
  const index = useMemo(() => buildIndex(home), [home])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [recents, setRecents] = useState(readRecents)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const vocab = useMemo(() => vocabulary(index), [index])
  const [ghostBox, setGhostBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  // Autocomplete: the rest of a likely search, shown as grey text after the cursor. Tab accepts it.
  const completion = useMemo(() => (open ? complete(query) : null), [open, query])
  const exact = useMemo(() => search(index, query), [index, query])
  // Nothing found? Check for a typo and show what the fixed search finds, under "Did you mean …?".
  const corrected = useMemo(() => (query.trim() && exact.length === 0 ? correct(query, vocab) : null), [query, exact, vocab])
  const groups = useMemo(() => (corrected ? search(index, corrected) : exact), [corrected, exact, index])
  const flat = useMemo(() => groups.flatMap((g) => g.entries), [groups])

  useEffect(() => setActive(0), [query])

  // ⌘K / Ctrl+K anywhere, or "/" when not already typing, jumps to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reportOpen = useRef(onOpenChange)
  reportOpen.current = onOpenChange
  useEffect(() => reportOpen.current?.(open), [open])

  // Hold the page still behind the results.
  useEffect(() => {
    if (!open) return
    document.documentElement.dataset.searching = ''
    return () => {
      delete document.documentElement.dataset.searching
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const remember = (q: string) => {
    const term = q.trim()
    if (!term) return
    setRecents((list) => {
      const next = [term, ...list.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENTS)
      writeRecents(next)
      return next
    })
  }

  const forget = (q?: string) => {
    setRecents((list) => {
      const next = q === undefined ? [] : list.filter((r) => r !== q)
      writeRecents(next)
      return next
    })
    inputRef.current?.focus()
  }

  /**
   * Choosing a result closes search, then goes there: same-page sections
   * scroll into place once the page is unlocked; other pages load as usual;
   * external links and the résumé open in a new tab (the link's own target).
   */
  const choose = (e: React.MouseEvent<HTMLAnchorElement>, entry: SearchEntry) => {
    remember(query)
    const id = samePageTarget(entry.href)
    close()
    if (!entry.href) e.preventDefault()
    if (id === null) return
    e.preventDefault()
    // Wait a frame so the scroll lock lifts before scrolling.
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      scrollToSection(el)
      history.replaceState(null, '', `#${id}`)
    })
  }

  // Line the ghost text up with the text in the field.
  useLayoutEffect(() => {
    const input = inputRef.current
    const box = input?.parentElement
    if (!completion || !input || !box) return setGhostBox(null)
    // A long search scrolls the field sideways; grey text can't line up then, so it moves to the results.
    const room = input.clientWidth - measure(input, completion)
    if (room < 0) return setGhostBox(null)
    setGhostBox({
      left: box.offsetLeft + input.offsetLeft,
      top: box.offsetTop + input.offsetTop,
      width: input.clientWidth,
      height: input.offsetHeight,
    })
  }, [completion, query])

  /** Take the suggestion: the autocomplete first, otherwise the typo fix. */
  const accept = (): boolean => {
    const next = completion ?? corrected
    if (!next) return false
    setQuery(next)
    setOpen(true)
    return true
  }

  const fill = (q: string) => {
    setQuery(q)
    setOpen(true)
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const atEnd = e.currentTarget.selectionStart === query.length
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if ((e.key === 'Tab' && !e.shiftKey) || (e.key === 'ArrowRight' && atEnd && completion)) {
      if (accept()) e.preventDefault()
    } else if (e.key === 'ArrowDown' && flat.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % flat.length)
    } else if (e.key === 'ArrowUp' && flat.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + flat.length) % flat.length)
    } else if (e.key === 'Enter' && query.trim() && flat[active]) {
      e.preventDefault()
      document.getElementById(`search-option-${active}`)?.click()
    }
  }

  let n = -1
  const option = (entry: SearchEntry) => {
    const i = ++n
    return (
      <a
        key={`${entry.section}-${entry.title}-${i}`}
        data-heart={entry.heart || undefined}
        id={`search-option-${i}`}
        role="option"
        aria-selected={i === active}
        className={styles.option}
        href={entry.href}
        {...(entry.href && isExternal(entry.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
        onMouseMove={() => setActive(i)}
        // Keep focus in the field so the panel survives the press (Safari doesn't focus links).
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => choose(e, entry)}
      >
        <span className={styles.optionTitle}>
          {entry.title}
          {entry.heart && (
            <svg className={styles.heart} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 14s-5.5-3.4-5.5-7.3A3 3 0 0 1 8 4.6a3 3 0 0 1 5.5 2.1C13.5 10.6 8 14 8 14Z" />
            </svg>
          )}
        </span>
        {entry.subtitle && <span className={styles.optionSubtitle}>{entry.subtitle}</span>}
        {entry.details.slice(0, 3).map((d) => (
          <span key={d} className={styles.optionDetail}>
            {d}
          </span>
        ))}
      </a>
    )
  }

  const suggestions = (
    <div className={styles.group} role="group" aria-label="Suggestions">
      <p className={styles.groupLabel}>Try</p>
      <div className={styles.chips}>
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            className={styles.chip}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fill(sug.toLowerCase())}
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className={`${styles.root} ${open ? styles.open : ''}`}>
      <div className={styles.scrim} aria-hidden="true" onPointerDown={close} data-testid="search-scrim" />
      <div className={styles.field}>
        <SearchField
          ref={inputRef}
          aria-label="Search Winston’s site"
          placeholder="Search"
          value={query}
          onValueChange={(v) => {
            setQuery(v)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node | null)) close()
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={open && flat[active] ? `search-option-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {completion && ghostBox && (
          <div className={styles.ghost} style={ghostBox} aria-hidden="true" data-testid="search-ghost">
            <span className={styles.ghostTyped}>{query}</span>
            <span
              className={styles.ghostRest}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                accept()
                inputRef.current?.focus()
              }}
            >
              {completion.slice(query.length)}
              <kbd className={styles.tabKey}>tab</kbd>
            </span>
          </div>
        )}
        {open && (
          <div className={styles.panel}>
            {query.trim() === '' ? (
              <>
                {recents.length > 0 && (
                  <div className={styles.group} role="group" aria-label="Recent searches">
                    <div className={styles.groupHead}>
                      <p className={styles.groupLabel}>Recent</p>
                      <button
                        type="button"
                        className={styles.clearAll}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => forget()}
                      >
                        Clear
                      </button>
                    </div>
                    <ul className={styles.recents}>
                      {recents.map((r) => (
                        <li key={r} className={styles.recent}>
                          <button
                            type="button"
                            className={styles.recentTerm}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => fill(r)}
                          >
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                              <circle cx="8" cy="8" r="6" />
                              <path d="M8 4.75V8l2.25 1.5" />
                            </svg>
                            {r}
                          </button>
                          <button
                            type="button"
                            className={styles.remove}
                            aria-label={`Remove “${r}” from recent searches`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => forget(r)}
                          >
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                              <path d="m4.5 4.5 7 7m0-7-7 7" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions}
              </>
            ) : (
              <div id="search-results" role="listbox" aria-label="Search results" className={styles.results}>
                {completion && !ghostBox && (
                  <button
                    type="button"
                    className={styles.didYouMean}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fill(completion)}
                  >
                    Search <b>“{completion.trim()}”</b>
                  </button>
                )}
                {corrected && (
                  <button
                    type="button"
                    className={styles.didYouMean}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fill(corrected)}
                  >
                    Did you mean <b>“{corrected.trim()}”</b>?
                  </button>
                )}
                {groups.length === 0 ? (
                  <>
                    <p className={styles.empty}>No results for “{query.trim()}”</p>
                    {suggestions}
                  </>
                ) : (
                  groups.map((g) => (
                    <div key={g.label ?? g.section} role="group" aria-label={g.label ?? g.section} className={styles.group}>
                      <p className={styles.groupLabel}>{g.label ?? g.section}</p>
                      {g.entries.map(option)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
