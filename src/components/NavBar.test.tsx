import { render, screen, within } from '@testing-library/react'
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
