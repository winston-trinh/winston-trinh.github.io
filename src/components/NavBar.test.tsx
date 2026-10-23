import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from './NavBar'

describe('NavBar', () => {
  it('toggles the theme', async () => {
    render(<NavBar />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('opens and closes the mobile menu', async () => {
    render(<NavBar />)
    const menu = screen.getByRole('button', { name: 'Open menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(menu)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks no link as current at the top of the page', () => {
    render(<NavBar />)
    for (const link of screen.getAllByRole('link').slice(1)) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })

  it('points section links back at the homepage when used on another page', () => {
    render(<NavBar home="/" />)
    expect(screen.getByRole('link', { name: 'Winston Trinh' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/#experience')
  })
})
