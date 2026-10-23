import { useEffect, useState } from 'react'
import { useActiveSection } from '../hooks/useActiveSection'
import { useTheme } from '../hooks/useTheme'
import { Icons } from './Icons'
import styles from './NavBar.module.css'

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1))

/** `home` prefixes the links, e.g. '/' on the blog so they jump back to homepage sections. */
export function NavBar({ home = '' }: { home?: string }) {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const active = useActiveSection(SECTION_IDS)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className={`${styles.nav} ${open ? styles.open : ''}`}>
      <nav className={styles.inner} aria-label="Primary">
        <a className={styles.brand} href={home || '#top'} onClick={() => setOpen(false)}>
          Winston Trinh
        </a>
        <ul id="nav-links" className={styles.links}>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={home + l.href}
                onClick={() => setOpen(false)}
                className={active === l.href.slice(1) ? styles.active : undefined}
                aria-current={active === l.href.slice(1) ? 'location' : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggle}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {theme === 'dark' ? <Icons.sun width={18} height={18} /> : <Icons.moon width={18} height={18} />}
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-links"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <Icons.close width={18} height={18} /> : <Icons.menu width={18} height={18} />}
          </button>
        </div>
      </nav>
    </header>
  )
}
