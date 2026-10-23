export interface PostMeta {
  slug: string
  title: string
  dek: string
  date: string
  readTime: string
  image: string
}

export const POSTS: PostMeta[] = [
  {
    slug: 'building-a-portfolio-that-looks-back',
    title: 'Building a portfolio that looks back at you',
    dek: '121 selfies, a few dozen tiny robot testers, and a few lessons I learned the fun way.',
    date: 'October 22, 2026',
    readTime: '7 min read',
    image: '/blog/gaze-grid.webp',
  },
]

export const postUrl = (slug: string) => `/blog/${slug}/`

/** Number of automated tests the post quotes; keep in sync with `npm test`. */
export const TEST_COUNT = 42
