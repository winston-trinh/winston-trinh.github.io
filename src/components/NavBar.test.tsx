import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setMedia } from '../test/setup'
import { DOCK_QUERY, NavBar } from './NavBar'

describe('NavBar', () => {
  it('flips the theme with the dark-mode switch', async () => {
    render(<NavBar />)
    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(toggle)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(toggle)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('marks no section as current at the top of the page', () => {
    render(<NavBar />)
    const tabs = within(screen.getByLabelText('Sections')).getAllByRole('link')
    expect(tabs.map((t) => t.textContent)).toEqual(['About', 'Experience', 'Education', 'Projects', 'Contact'])
    for (const tab of tabs) expect(tab).not.toHaveAttribute('aria-current')
  })

  it('points section links back at the homepage when used on another page', () => {
    render(<NavBar home="/" />)
    expect(screen.getByRole('link', { name: 'Winston Trinh' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/#experience')
  })

  it('docks the tabs at the bottom, with icons, on small screens', () => {
    setMedia(DOCK_QUERY, true)
    render(<NavBar />)
    const tabs = within(screen.getByLabelText('Sections')).getAllByRole('link')
    expect(tabs).toHaveLength(5)
    expect(tabs[0].querySelector('svg')).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Winston Trinh' })).toBeNull()
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Search/ })).toBeInTheDocument()
  })
})

describe('NavBar section highlight', () => {
  /** Put each section's top at a viewport offset, as a real layout would. */
  function place(tops: Record<string, number>) {
    for (const [id, top] of Object.entries(tops)) {
      let el = document.getElementById(id)
      if (!el) {
        el = document.createElement('section')
        el.id = id
        document.body.appendChild(el)
      }
      el.getBoundingClientRect = () => ({ top }) as DOMRect
    }
  }
  const selected = () =>
    within(screen.getByLabelText('Sections'))
      .getAllByRole('link')
      .filter((t) => t.hasAttribute('aria-current'))
      .map((t) => t.textContent)

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('keeps a clicked tab selected while the page scrolls past other sections', async () => {
    place({ about: -900, experience: -300, education: 900, projects: 1200, contact: 1500 })
    render(<NavBar />)
    expect(selected()).toEqual(['Experience'])

    await userEvent.click(screen.getByRole('link', { name: 'Contact' }))
    expect(selected()).toEqual(['Contact'])

    // Smooth scrolling passes through Education and Projects on the way down.
    place({ about: -1500, experience: -1000, education: 100, projects: 1200, contact: 1500 })
    act(() => window.dispatchEvent(new Event('scroll')))
    expect(selected()).toEqual(['Contact'])

    // Once the page arrives, the spy takes over again.
    place({ about: -2000, experience: -1500, education: -1000, projects: -500, contact: 100 })
    act(() => window.dispatchEvent(new Event('scroll')))
    expect(selected()).toEqual(['Contact'])
  })

  it('hands the highlight back when the reader scrolls by hand', async () => {
    place({ about: -900, experience: 900, education: 1000, projects: 1200, contact: 1500 })
    render(<NavBar />)
    await userEvent.click(screen.getByRole('link', { name: 'Contact' }))
    expect(selected()).toEqual(['Contact'])

    act(() => window.dispatchEvent(new Event('wheel')))
    expect(selected()).toEqual(['About'])
  })
})
