import { render, screen } from '@testing-library/react'
import { renderInlineMarkdown } from './inlineMarkdown'

describe('renderInlineMarkdown', () => {
  it('turns markdown links into anchors', () => {
    render(<p>{renderInlineMarkdown('Born in [Portland, OR](https://maps.example/portland). Go [here](#education).')}</p>)
    const external = screen.getByRole('link', { name: 'Portland, OR' })
    expect(external).toHaveAttribute('href', 'https://maps.example/portland')
    expect(external).toHaveAttribute('target', '_blank')
    const internal = screen.getByRole('link', { name: 'here' })
    expect(internal).toHaveAttribute('href', '#education')
    expect(internal).not.toHaveAttribute('target')
    expect(screen.getByText(/Born in/).textContent).toBe('Born in Portland, OR. Go here.')
  })

  it('leaves plain text unchanged', () => {
    expect(renderInlineMarkdown('No links here.')).toEqual(['No links here.'])
  })
})
