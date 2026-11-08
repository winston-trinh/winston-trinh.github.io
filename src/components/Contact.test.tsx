import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'

describe('Contact', () => {
  it('links to the blog in the same tab, styled like the other buttons', () => {
    render(<Contact />)
    const blog = screen.getByRole('link', { name: 'Blog' })
    expect(blog).toHaveAttribute('href', '/blog/')
    expect(blog).not.toHaveAttribute('target')
    expect(blog.querySelector('.lg-glass.lg-button')).not.toBeNull()
    expect(blog.querySelector('svg')).not.toBeNull()
  })

  it('makes Send Email the filled glass button', () => {
    render(<Contact />)
    const email = screen.getByRole('link', { name: 'Send Email' })
    expect(email.querySelector('.lg-button')).toHaveAttribute('data-variant', 'filled')
    expect(screen.getByRole('link', { name: 'GitHub' }).querySelector('.lg-button')).not.toHaveAttribute('data-variant')
  })

  it('opens the résumé in a new tab', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank')
  })
})
