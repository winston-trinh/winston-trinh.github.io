import { Glass, Switch, TabBar } from 'glisse'
import { useActiveSection } from '../hooks/useActiveSection'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'
import { Icons } from './Icons'
import { Search } from './Search'
import styles from './NavBar.module.css'

export const NAV_LINKS = [
  { id: 'about', label: 'About', icon: <Icons.person /> },
  { id: 'experience', label: 'Experience', icon: <Icons.briefcase /> },
  { id: 'education', label: 'Education', icon: <Icons.cap /> },
  { id: 'projects', label: 'Projects', icon: <Icons.folder /> },
  { id: 'contact', label: 'Contact', icon: <Icons.chat /> },
]

/** Below this width the section tabs drop to a floating bar at the bottom, as on iPhone. */
export const DOCK_QUERY = '(max-width: 900px)'

const SECTION_IDS = NAV_LINKS.map((l) => l.id)

/**
 * Floating Liquid Glass chrome: section tabs, search and the dark-mode switch.
 * `home` prefixes the links, e.g. '/' on the blog so they jump back to homepage sections.
 */
export function NavBar({ home = '' }: { home?: string }) {
  const { theme, setPreference } = useTheme()
  const docked = useMediaQuery(DOCK_QUERY)
  const active = useActiveSection(home ? [] : SECTION_IDS) || null
  const dark = theme === 'dark'

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
        <Search home={home} />
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
