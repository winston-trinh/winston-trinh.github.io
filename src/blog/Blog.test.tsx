import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import { BlogApp } from './BlogPages'
import { POSTS, TEST_COUNT, postUrl } from './posts'

// jsdom can't measure text, so real Mermaid can't draw here; stand in a fake renderer.
const { initialize } = vi.hoisted(() => ({ initialize: vi.fn() }))
vi.mock('./loadMermaid', () => ({
  loadMermaid: async () => ({
    initialize,
    render: vi.fn(async (id: string) => ({ svg: `<svg data-testid="diagram" id="${id}"></svg>` })),
  }),
}))

describe('blog', () => {
  it('lists every post on the index page', () => {
    render(<BlogApp page="index" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Things I’ve written.' })).toBeInTheDocument()
    for (const post of POSTS) {
      expect(screen.getByRole('link', { name: new RegExp(post.title) })).toHaveAttribute('href', postUrl(post.slug))
    }
  })

  it('renders the portfolio post with its diagrams', async () => {
    render(<BlogApp page="building-a-portfolio-that-looks-back" />)
    expect(screen.getByRole('heading', { level: 1, name: POSTS[0].title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What I learned' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '‹ All posts' })).toHaveAttribute('href', '/blog/')
    await waitFor(() => expect(screen.getAllByTestId('diagram')).toHaveLength(2))
  })

  it('draws diagram labels as SVG text, which strict sanitizing keeps', async () => {
    render(<BlogApp page="building-a-portfolio-that-looks-back" />)
    await waitFor(() => expect(initialize).toHaveBeenCalled())
    for (const [config] of initialize.mock.calls) {
      expect(config).toMatchObject({ securityLevel: 'strict', htmlLabels: false, flowchart: { htmlLabels: false } })
    }
  })

  it('has an HTML page for every post', () => {
    for (const post of POSTS) {
      const html = readFileSync(resolve(process.cwd(), `blog/${post.slug}/index.html`), 'utf8')
      expect(html).toContain(`data-page="${post.slug}"`)
    }
  })

  it('quotes the real number of tests', () => {
    const files: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) walk(path)
        else if (/\.test\.tsx?$/.test(name)) files.push(path)
      }
    }
    walk(resolve(process.cwd(), 'src'))
    const count = files.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/^\s*it\(/gm)?.length ?? 0), 0)
    expect(TEST_COUNT).toBe(count)
  })
})
