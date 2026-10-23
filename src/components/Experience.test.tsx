import { render, screen, within } from '@testing-library/react'
import { Experience } from './Experience'

describe('Experience', () => {
  it('shows AT&T once with both roles inside the same card', () => {
    render(<Experience />)
    expect(screen.getAllByRole('heading', { name: 'AT&T' })).toHaveLength(1)

    const card = screen.getByRole('article', { name: 'AT&T' })
    const roles = within(card).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)
    expect(roles).toEqual(['Sr. Specialist Member of Technical Staff', 'TDP Network Engineer'])
    expect(within(card).getByText('2 roles')).toBeInTheDocument()
  })

  it('renders single-role companies without a timeline', () => {
    render(<Experience />)
    const card = screen.getByRole('article', { name: 'USC Sol Price School of Public Policy' })
    expect(within(card).getByText('Research Assistant')).toBeInTheDocument()
    expect(within(card).queryAllByRole('heading', { level: 4 })).toHaveLength(0)
  })

  it('puts the location on its own line between the title and the date range', () => {
    render(<Experience />)
    const card = screen.getByRole('article', { name: 'AT&T' })
    const title = within(card).getByRole('heading', { name: 'TDP Network Engineer' })
    const location = within(card).getByText('Atlanta, GA')
    const dates = within(card).getByText('July 2025 – September 2026')

    expect(location.tagName).toBe('P')
    expect(location.textContent).toBe('Atlanta, GA')
    expect(title.compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(location.compareDocumentPosition(dates) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('links the logo to the same page as the company name', () => {
    render(<Experience />)
    const card = screen.getByRole('article', { name: 'AT&T' })
    const name = within(card).getByRole('link', { name: 'AT&T' })
    const logo = card.querySelector('img')!.closest('a')!
    expect(logo).toHaveAttribute('href', name.getAttribute('href'))
    expect(logo).toHaveAttribute('tabindex', '-1')
  })
})
