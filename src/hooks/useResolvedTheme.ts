import { useEffect, useState } from 'react'
import { useMediaQuery } from './useMediaQuery'
import type { Theme } from './useTheme'

/** The theme actually on screen, following both the system setting and the nav toggle. */
export function useResolvedTheme(): Theme {
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const read = () => document.documentElement.dataset.theme
  const [explicit, setExplicit] = useState(read)

  useEffect(() => {
    const observer = new MutationObserver(() => setExplicit(read()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  if (explicit === 'light' || explicit === 'dark') return explicit
  return systemDark ? 'dark' : 'light'
}
