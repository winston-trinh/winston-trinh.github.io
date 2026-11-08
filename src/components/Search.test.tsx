import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from './Search'

describe('Search', () => {
  it('opens on focus, blurs the page and shows instant results', async () => {
    render(<Search />)
    const box = screen.getByRole('combobox', { name: /Search/ })
    await userEvent.click(box)
    expect(box).toHaveAttribute('aria-expanded', 'true')
    expect(document.documentElement).toHaveAttribute('data-searching')

    await userEvent.type(box, 'education')
    const results = screen.getByRole('listbox', { name: 'Search results' })
    const usc = within(results).getByRole('option', { name: /University of Southern California/ })
    expect(usc).toHaveAttribute('href', '#education')
    expect(usc).toHaveTextContent('Degree: Bachelor of Science – Computer Science, December 2024')
  })

  it('moves through results with the arrow keys and closes on Escape', async () => {
    render(<Search />)
    const box = screen.getByRole('combobox', { name: /Search/ })
    await userEvent.type(box, 'experience')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(box).toHaveAttribute('aria-activedescendant', options[1].id)

    await userEvent.keyboard('{Escape}')
    expect(box).toHaveAttribute('aria-expanded', 'false')
    expect(box).toHaveValue('')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.documentElement).not.toHaveAttribute('data-searching')
  })

  it('says so when nothing matches', async () => {
    render(<Search />)
    await userEvent.type(screen.getByRole('combobox', { name: /Search/ }), 'zzzz')
    expect(screen.getByText('No results for “zzzz”')).toBeInTheDocument()
  })

  it('closes and scrolls to the section when a result is chosen', async () => {
    const section = document.createElement('section')
    section.id = 'education'
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    document.body.append(section)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
    try {
      render(<Search />)
      const box = screen.getByRole('combobox', { name: /Search/ })
      await userEvent.type(box, 'education')
      await userEvent.click(screen.getByRole('option', { name: /University of Southern California/ }))
      expect(box).toHaveAttribute('aria-expanded', 'false')
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
      expect(window.location.hash).toBe('#education')
    } finally {
      section.remove()
      scrollTo.mockRestore()
      history.replaceState(null, '', '/')
    }
  })

  it('opens external results in a new tab', async () => {
    render(<Search />)
    await userEvent.type(screen.getByRole('combobox', { name: /Search/ }), 'linkedin')
    const linkedin = screen.getByRole('option', { name: /^LinkedIn/ })
    expect(linkedin).toHaveAttribute('target', '_blank')
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/winstontrinh/')
  })

  it('remembers past searches for the session, with a way to clear them', async () => {
    sessionStorage.clear()
    render(<Search />)
    const box = screen.getByRole('combobox', { name: /Search/ })
    for (const q of ['education', 'projects']) {
      await userEvent.type(box, q)
      await userEvent.click(screen.getAllByRole('option')[0])
    }
    await userEvent.click(box)
    const recents = within(screen.getByRole('group', { name: 'Recent searches' }))
    expect(recents.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['projects', 'education'])
    expect(screen.getByRole('group', { name: 'Suggestions' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove “projects” from recent searches' }))
    expect(recents.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['education'])
    await userEvent.click(recents.getByRole('button', { name: 'education' }))
    expect(box).toHaveValue('education')

    await userEvent.clear(box)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.queryByRole('group', { name: 'Recent searches' })).toBeNull()
    expect(sessionStorage.getItem('recent-searches')).toBeNull()
  })

  it('suggests the rest of a search as grey text, and Tab takes it', async () => {
    render(<Search />)
    const box = screen.getByRole('combobox', { name: /Search/ })
    await userEvent.type(box, 'is winston trinh s')
    expect(screen.getByTestId('search-ghost')).toHaveTextContent('ingle?')
    // Louise shows before the suggestion is even taken.
    expect(screen.getByRole('option', { name: /Louise/ })).toBeInTheDocument()
    await userEvent.keyboard('{Tab}')
    expect(box).toHaveValue('is winston trinh single?')
    expect(box).toHaveFocus()
    expect(screen.queryByTestId('search-ghost')).toBeNull()
  })

  it('offers "Did you mean …?" for typos, with the fixed search’s results', async () => {
    render(<Search />)
    const box = screen.getByRole('combobox', { name: /Search/ })
    await userEvent.type(box, 'does winston have a gff')
    const fix = screen.getByRole('button', { name: /Did you mean/ })
    expect(fix).toHaveTextContent('Did you mean “does winston have a gf”?')
    expect(screen.getByRole('option', { name: /Louise/ })).toBeInTheDocument()

    await userEvent.clear(box)
    await userEvent.type(box, 'educarion')
    expect(screen.getByRole('button', { name: /Did you mean/ })).toHaveTextContent('Did you mean “education”?')
    expect(screen.getByRole('option', { name: /University of Southern California/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Did you mean/ }))
    expect(box).toHaveValue('education')
    expect(screen.queryByRole('button', { name: /Did you mean/ })).toBeNull()
  })

  it('focuses with ⌘K', async () => {
    render(<Search />)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByRole('combobox', { name: /Search/ })).toHaveFocus()
  })
})
