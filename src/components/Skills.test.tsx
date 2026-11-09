import { fireEvent, render, screen } from '@testing-library/react'
import { DATA } from '../data/resume'
import { moveItem, nearest, scatter, Skills } from './Skills'

describe('Skills', () => {
  it('lists every skill, scattered the same way on every visit', () => {
    render(<Skills skills={DATA.skills} />)
    const pills = screen.getAllByRole('listitem')
    expect(pills.map((p) => p.textContent)).toEqual(DATA.skills)
    expect(scatter('Python', 3)).toBe(scatter('Python', 3))
    expect(new Set(DATA.skills.map((s) => scatter(s, 3))).size).toBeGreaterThan(DATA.skills.length / 2)
    for (const s of DATA.skills) expect(Math.abs(scatter(s, 1))).toBeLessThanOrEqual(1)
  })

  it('spreads out while the pointer is over it and settles when it leaves', () => {
    render(<Skills skills={DATA.skills} />)
    const cloud = screen.getByRole('list', { name: 'Skills' })
    fireEvent.pointerEnter(cloud, { pointerType: 'mouse' })
    expect(cloud).toHaveAttribute('data-spread')
    fireEvent.pointerLeave(cloud, { pointerType: 'mouse' })
    expect(cloud).not.toHaveAttribute('data-spread')
  })

  it('spreads on a tap and settles on a tap elsewhere', () => {
    render(
      <>
        <p>Elsewhere</p>
        <Skills skills={DATA.skills} />
      </>,
    )
    const cloud = screen.getByRole('list', { name: 'Skills' })
    fireEvent.pointerDown(screen.getByText('Python'), { pointerType: 'touch' })
    // A finger lifting also "leaves"; that must not settle it.
    fireEvent.pointerLeave(cloud, { pointerType: 'touch' })
    expect(cloud).toHaveAttribute('data-spread')
    fireEvent.pointerDown(screen.getByText('Elsewhere'), { pointerType: 'touch' })
    expect(cloud).not.toHaveAttribute('data-spread')
  })

  it('moves a dropped pill to the nearest spot, shifting the rest over', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
    const spots = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 40 }]
    expect(nearest(spots, 90, 10)).toBe(1)
    expect(nearest(spots, 5, 35)).toBe(2)
  })
})
