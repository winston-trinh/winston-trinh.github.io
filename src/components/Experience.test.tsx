import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DATA } from '../data/resume'
import { Experience } from './Experience'

describe('Experience', () => {
  it('gives each company one folder', () => {
    render(<Experience />)
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(
      DATA.experience.map((c) => c.company),
    )
    expect(screen.getAllByRole('heading', { name: 'AT&T', level: 3 })).toHaveLength(1)
  })

  it('files both AT&T roles in its folder, newest first and in front', () => {
    render(<Experience />)
    const att = screen.getByRole('article', { name: 'AT&T' })
    expect(within(att).getByText('2 roles')).toBeInTheDocument()
    const sheets = within(att).getAllByRole('button', { name: /^Show / })
    // Slot 0 is the front of the stack.
    expect(sheets.map((b) => [b.getAttribute('aria-label'), b.dataset.slot])).toEqual([
      ['Show Sr. Specialist Member of Technical Staff', '0'],
      ['Show TDP Network Engineer', '1'],
    ])
    expect(within(att).getByRole('heading', { level: 4 })).toHaveTextContent('Sr. Specialist Member of Technical Staff')
  })

  it('shows the accomplishments of whichever role is pointed at', async () => {
    render(<Experience />)
    const att = screen.getByRole('article', { name: 'AT&T' })
    await userEvent.hover(within(att).getByRole('button', { name: 'Show TDP Network Engineer' }))
    expect(within(att).getByRole('heading', { level: 4 })).toHaveTextContent('TDP Network Engineer')
    const flap = within(att.querySelector<HTMLElement>('[id^="folder-"]')!)
    const bullets = flap.getAllByRole('listitem').map((li) => li.textContent)
    expect(bullets[1]).toBe('Promoted from TDP Network Engineer I to TDP Network Engineer II in August 2026.')
    expect(flap.getByText('Atlanta, GA')).toBeInTheDocument()
    expect(flap.getByText('July 2025 – September 2026')).toBeInTheDocument()
  })

  it('shuffles a clicked role to the front, and back again when the folder is put away', async () => {
    render(
      <>
        <p>Page background</p>
        <Experience />
      </>,
    )
    const att = screen.getByRole('article', { name: 'AT&T' })
    const tdp = within(att).getByRole('button', { name: 'Show TDP Network Engineer' })
    const sr = within(att).getByRole('button', { name: 'Show Sr. Specialist Member of Technical Staff' })
    await userEvent.click(tdp)
    expect(tdp.dataset.slot).toBe('0')
    expect(sr.dataset.slot).toBe('1')
    expect(within(att).getByRole('heading', { level: 4 })).toHaveTextContent('TDP Network Engineer')

    await userEvent.click(screen.getByText('Page background'))
    expect(att).not.toHaveAttribute('data-open')
    expect(tdp.dataset.slot).toBe('1')
    expect(sr.dataset.slot).toBe('0')
    expect(within(att).getByRole('heading', { level: 4 })).toHaveTextContent('Sr. Specialist Member of Technical Staff')
  })

  it('lists the dates, then the location, above the accomplishments', () => {
    render(<Experience />)
    const flap = screen.getByRole('article', { name: 'AT&T' }).querySelector('[id^="folder-"]')!
    const lines = [...flap.querySelector('p')!.children].map((c) => c.textContent)
    expect(lines).toEqual(['October 2026 – Present', 'Seattle, WA'])
  })

  it('names the role on the cover of a single-role folder, with no sheets to pick', () => {
    render(<Experience />)
    const price = screen.getByRole('article', { name: 'USC Sol Price School of Public Policy' })
    expect(within(price).getByRole('heading', { level: 3 }).nextElementSibling).toHaveTextContent('Research Assistant')
    expect(within(price).queryAllByRole('button', { name: /^Show / })).toHaveLength(0)
  })

  it('links each role to its company', () => {
    render(<Experience />)
    const att = screen.getByRole('article', { name: 'AT&T' })
    expect(within(att).getByRole('link', { name: 'AT&T' })).toHaveAttribute('href', DATA.experience[0].href)
  })
})
