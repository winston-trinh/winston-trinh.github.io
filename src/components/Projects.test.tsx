import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DATA } from '../data/resume'
import { groupProjects, Projects } from './Projects'

describe('Projects', () => {
  it('puts projects from the same month in one folder', () => {
    const groups = groupProjects(DATA.projects)
    expect(groups.map((g) => g.dates)).toEqual(['March 2025', 'February 2025', 'November 2023', 'October 2023'])
    expect(groups.at(-1)!.projects.map((p) => p.title)).toEqual(['Traveling Trojan', 'Cache Simulator'])
    expect(groups.flatMap((g) => g.projects)).toHaveLength(DATA.projects.length)
  })

  it('shows one folder per month', () => {
    render(<Projects />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getAllByRole('button', { name: /^Open the .* folder/ })).toHaveLength(4)
  })

  it('opens a folder on tap and keeps only one open', async () => {
    render(<Projects />)
    const march = screen.getByRole('article', { name: 'March 2025' })
    const october = screen.getByRole('article', { name: 'October 2023' })
    await userEvent.click(within(march).getByRole('button', { name: /folder/ }))
    expect(march).toHaveAttribute('data-open')

    await userEvent.click(within(october).getByRole('button', { name: /folder/ }))
    expect(october).toHaveAttribute('data-open')
    expect(march).not.toHaveAttribute('data-open')
  })

  it('shows the details of whichever screenshot is chosen', async () => {
    render(<Projects />)
    const october = screen.getByRole('article', { name: 'October 2023' })
    expect(within(october).getByRole('heading', { level: 4 })).toHaveTextContent('Traveling Trojan')
    await userEvent.click(within(october).getByRole('button', { name: 'Show Cache Simulator' }))
    expect(within(october).getByRole('heading', { level: 4 })).toHaveTextContent('Cache Simulator')
    expect(within(october).getByRole('button', { name: 'Show Cache Simulator' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps a clicked project chosen until another is clicked, the background is clicked, or another folder opens', async () => {
    render(
      <>
        <p>Page background</p>
        <Projects />
      </>,
    )
    const october = screen.getByRole('article', { name: 'October 2023' })
    const march = screen.getByRole('article', { name: 'March 2025' })
    const heading = () => within(october).getByRole('heading', { level: 4 })

    await userEvent.click(within(october).getByRole('button', { name: 'Show Cache Simulator' }))
    expect(october).toHaveAttribute('data-open')
    expect(heading()).toHaveTextContent('Cache Simulator')

    // Hovering the other screenshot no longer changes the pick…
    await userEvent.hover(within(october).getByRole('button', { name: 'Show Traveling Trojan' }))
    expect(heading()).toHaveTextContent('Cache Simulator')
    // …clicking it does.
    await userEvent.click(within(october).getByRole('button', { name: 'Show Traveling Trojan' }))
    expect(heading()).toHaveTextContent('Traveling Trojan')
    expect(october).toHaveAttribute('data-open')

    await userEvent.click(screen.getByText('Page background'))
    expect(october).not.toHaveAttribute('data-open')

    await userEvent.click(within(october).getByRole('button', { name: 'Show Cache Simulator' }))
    await userEvent.click(within(march).getByRole('button', { name: /folder/ }))
    expect(march).toHaveAttribute('data-open')
    expect(october).not.toHaveAttribute('data-open')

    await userEvent.click(screen.getByText('Page background'))
    expect(march).not.toHaveAttribute('data-open')
  })
})
