import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'

describe('Contact', () => {
  it('links to the blog in the same tab, styled like the other buttons', () => {
    render(<Contact />)
    const blog = screen.getByRole('link', { name: 'Blog' })
    expect(blog).toHaveAttribute('href', '/blog/')
    expect(blog).not.toHaveAttribute('target')
    expect(blog).toHaveClass('btn', 'btn-secondary')
    expect(blog.querySelector('svg')).not.toBeNull()
  })

  it('opens the résumé in a new tab', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank')
  })
})
