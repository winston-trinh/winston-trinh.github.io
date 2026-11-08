import { setMedia } from '../test/setup'
import { handleSectionLinks, scrollToSection } from './scrollToSection'

/** A section whose top sits `top` px down the page, on a page `height` px tall. */
function place(top: number, height = 8000) {
  const el = document.createElement('section')
  el.id = 'contact'
  el.getBoundingClientRect = () => ({ top: top - window.scrollY }) as DOMRect
  document.body.append(el)
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: height })
  return el
}

describe('scrollToSection', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    history.replaceState(null, '', '/')
  })

  it('cuts most of a long jump, then glides the last stretch', () => {
    scrollToSection(place(6000))
    expect(scrollTo.mock.calls).toEqual([
      [{ top: 5400, behavior: 'instant' }],
      [{ top: 6000, behavior: 'smooth' }],
    ])
  })

  it('glides the whole way when the section is close', () => {
    scrollToSection(place(500))
    expect(scrollTo.mock.calls).toEqual([[{ top: 500, behavior: 'smooth' }]])
  })

  it('cuts upward too, and stops at the bottom of the page', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 7200 })
    scrollToSection(place(1000))
    expect(scrollTo.mock.calls).toEqual([
      [{ top: 1600, behavior: 'instant' }],
      [{ top: 1000, behavior: 'smooth' }],
    ])
    scrollTo.mockClear()
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    scrollToSection(place(7900))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 7200, behavior: 'smooth' })
  })

  it('jumps without any motion when the reader asks for less', () => {
    setMedia('(prefers-reduced-motion: reduce)', true)
    scrollToSection(place(6000))
    expect(scrollTo.mock.calls).toEqual([[{ top: 6000, behavior: 'instant' }]])
  })

  it('takes over clicks on links to a section of this page', () => {
    place(6000)
    const link = document.createElement('a')
    link.href = '#contact'
    link.textContent = 'Contact'
    document.body.append(link)
    const stop = handleSectionLinks()
    try {
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      link.dispatchEvent(click)
      expect(click.defaultPrevented).toBe(true)
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 6000, behavior: 'smooth' })
      expect(window.location.hash).toBe('#contact')
    } finally {
      stop()
    }
  })
})
