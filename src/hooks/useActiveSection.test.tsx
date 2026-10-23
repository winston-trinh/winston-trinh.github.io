import { act, renderHook } from '@testing-library/react'
import { useActiveSection } from './useActiveSection'

const IDS = ['about', 'experience', 'education']

/** Place sections so their tops sit at the given viewport offsets. */
function layout(tops: Record<string, number>) {
  for (const id of IDS) {
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('section')
      el.id = id
      document.body.appendChild(el)
    }
    el.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect
  }
}

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useActiveSection', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    scrollTo(0)
  })

  it('highlights nothing while the hero is at the top', () => {
    layout({ about: 900, experience: 1800, education: 2700 })
    const { result } = renderHook(() => useActiveSection(IDS))
    expect(result.current).toBeNull()
  })

  it('follows the section under the reading line as the user scrolls', () => {
    layout({ about: 900, experience: 1800, education: 2700 })
    const { result } = renderHook(() => useActiveSection(IDS))

    layout({ about: 100, experience: 1000, education: 1900 })
    scrollTo(800)
    expect(result.current).toBe('about')

    layout({ about: -800, experience: 200, education: 1000 })
    scrollTo(1700)
    expect(result.current).toBe('experience')

    layout({ about: 900, experience: 1800, education: 2700 })
    scrollTo(0)
    expect(result.current).toBeNull()
  })

  it('selects the last section at the bottom of the page', () => {
    layout({ about: -3000, experience: -2000, education: 500 })
    const { result } = renderHook(() => useActiveSection(IDS))
    expect(result.current).toBe('experience')
    scrollTo(4200) // 4200 + 800 = scrollHeight
    expect(result.current).toBe('education')
  })
})
