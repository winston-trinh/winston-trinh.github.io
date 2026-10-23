import { useEffect, useState } from 'react'

/**
 * Id of the section currently under the reading line (just below the nav), or
 * null while the hero at the top of the page is still in charge.
 */
export function useActiveSection(ids: string[], offset = 0.35): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(',')

  useEffect(() => {
    const list = key.split(',')
    let frame = 0
    let scheduled = false

    const update = () => {
      scheduled = false
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 48
      const line = navH + window.innerHeight * offset
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      let current: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // The last section may be too short to reach the line; the page end selects it.
      if (atBottom && window.scrollY > 0) current = list[list.length - 1]
      setActive(current)
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [key, offset])

  return active
}
