import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PAGES = ['index.html', 'blog/index.html', 'blog/building-a-portfolio-that-looks-back/index.html']

it('gives every page a link-preview image that exists, so previews never fall back to a random page image', () => {
  for (const page of PAGES) {
    const html = readFileSync(resolve(process.cwd(), page), 'utf8')
    const image = html.match(/<meta property="og:image" content="https:\/\/winstontrinh\.com(\/[^"]+)"/)?.[1]
    expect(image, page).toBe('/og-image.png')
    expect(existsSync(resolve(process.cwd(), 'public', '.' + image))).toBe(true)
    expect(html).toMatch(/<meta property="og:title" content="[^"]+"/)
  }
})
