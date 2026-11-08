/** How far, in screen heights, a jump may glide. Anything longer cuts closer first. */
const GLIDE = 0.75

/**
 * Scroll `el` to the top of the page, under the floating bar. A smooth scroll
 * across the whole page makes the browser paint every section in between, and
 * on phones that stalls, then lands all at once. So a long jump cuts to just
 * short of the target and glides only the last stretch.
 */
export function scrollToSection(el: Element): void {
  const root = document.documentElement
  const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
  const max = Math.max(0, root.scrollHeight - window.innerHeight)
  const target = Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - pad))
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: target, behavior: 'instant' })
    return
  }
  const distance = target - window.scrollY
  const glide = window.innerHeight * GLIDE
  if (Math.abs(distance) > glide) {
    window.scrollTo({ top: target - Math.sign(distance) * glide, behavior: 'instant' })
  }
  window.scrollTo({ top: target, behavior: 'smooth' })
}

/**
 * Clicks on links to a section of this page scroll with `scrollToSection`
 * instead of the browser's own jump. Returns a function that stops listening.
 */
export function handleSectionLinks(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = e.target instanceof Element ? e.target.closest('a[href]') : null
    if (!(link instanceof HTMLAnchorElement) || !link.hash || (link.target && link.target !== '_self')) return
    if (link.origin !== window.location.origin || link.pathname !== window.location.pathname) return
    const el = document.getElementById(decodeURIComponent(link.hash.slice(1)))
    if (!el) return
    e.preventDefault()
    scrollToSection(el)
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash)
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
