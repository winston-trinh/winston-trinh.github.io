import { useEffect, useState } from 'react'
import { Glass, Switch, TabBar } from 'glisse'
import { useActiveSection } from '../hooks/useActiveSection'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'
import { Icons } from './Icons'
import { Search } from './Search'
import styles from './NavBar.module.css'

const NAV_LINKS = [
  { id: 'about', label: 'About', icon: <Icons.person /> },
  { id: 'experience', label: 'Experience', icon: <Icons.briefcase /> },
  { id: 'projects', label: 'Projects', icon: <Icons.folder /> },
  { id: 'education', label: 'Education', icon: <Icons.cap /> },
  { id: 'contact', label: 'Contact', icon: <Icons.chat /> },
]

/** Below this width the section tabs drop to a floating bar at the bottom, as on iPhone. */
export const DOCK_QUERY = '(max-width: 900px)'

const SECTION_IDS = NAV_LINKS.map((l) => l.id)

/** The section id a "#section" hash names, or null if it names none of ours. */
function sectionFromHash(hash: string): string | null {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  return SECTION_IDS.includes(id) ? id : null
}

/**
 * Floating Liquid Glass chrome: section tabs, search and the dark-mode switch.
 * `home` prefixes the links, e.g. '/' on the blog so they jump back to homepage sections.
 */
export function NavBar({ home = '' }: { home?: string }) {
  const { theme, setPreference } = useTheme()
  const docked = useMediaQuery(DOCK_QUERY)
  const spied = useActiveSection(home ? [] : SECTION_IDS) || null
  // A tab the reader chose (or a #section in the URL) stays selected while the
  // page scrolls there. Otherwise the scroll-spy would slide the highlight
  // through every section in between.
  const [chosen, setChosen] = useState<string | null>(() =>
    home ? null : sectionFromHash(window.location.hash),
  )
  // While search is open the page is blurred behind it, so no section is "current".
  const [searching, setSearching] = useState(false)
  const active = searching ? null : (chosen ?? spied)
  const dark = theme === 'dark'

  useEffect(() => {
    if (chosen && spied === chosen) setChosen(null)
  }, [chosen, spied])

  useEffect(() => {
    if (!chosen) return
    // Give the highlight back if the reader scrolls by hand, or the jump never lands.
    const release = () => setChosen(null)
    const timer = window.setTimeout(release, 4000)
    const events = ['wheel', 'touchstart', 'keydown'] as const
    for (const e of events) window.addEventListener(e, release, { passive: true })
    return () => {
      window.clearTimeout(timer)
      for (const e of events) window.removeEventListener(e, release)
    }
  }, [chosen])

  const tabs = (
    <TabBar
      aria-label="Sections"
      className={docked ? styles.dockTabs : styles.tabs}
      items={NAV_LINKS.map((l) => ({
        value: l.id,
        label: l.label,
        href: `${home}#${l.id}`,
        ...(docked ? { icon: l.icon } : {}),
      }))}
      value={active}
      onClick={(e) => {
        const link = (e.target as Element).closest('a')
        const id = link ? sectionFromHash(link.hash) : null
        if (id && !home) setChosen(id)
      }}
    />
  )

  return (
    <>
      <header className={styles.bar}>
        {!docked && (
          <a className={styles.brand} href={home || '#top'}>
            Winston Trinh
          </a>
        )}
        {!docked && tabs}
        <Search home={home} onOpenChange={setSearching} />
        <Glass className={styles.theme}>
          <span className={styles.themeIcon} data-mode={dark ? 'dark' : 'light'} aria-hidden="true">
            {dark ? <Icons.moon width={18} height={18} /> : <Icons.sun width={18} height={18} />}
          </span>
          <Switch
            aria-label="Dark mode"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            checked={dark}
            onCheckedChange={(on) => setPreference(on ? 'dark' : 'light')}
          />
        </Glass>
      </header>
      {docked && <nav className={styles.dock}>{tabs}</nav>}
    </>
  )
}
