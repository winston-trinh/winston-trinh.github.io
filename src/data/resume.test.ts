import { DATA } from './resume'

describe('resume data', () => {
  it('combines both AT&T roles under one company, newest first', () => {
    const att = DATA.experience.filter((c) => c.company === 'AT&T')
    expect(att).toHaveLength(1)
    expect(att[0].roles.map((r) => r.title)).toEqual([
      'Sr. Specialist Member of Technical Staff',
      'TDP Network Engineer',
    ])
  })

  it('stores bullets without leading bullet characters', () => {
    const bullets = DATA.experience.flatMap((c) => c.roles.flatMap((r) => r.bullets))
    expect(bullets.length).toBeGreaterThan(0)
    for (const b of bullets) expect(b).not.toMatch(/^[•\s]/)
  })

  it('only links to section anchors that exist', () => {
    const anchors = DATA.summary.flatMap((s) => [...s.matchAll(/\]\((#[^)]+)\)/g)].map((m) => m[1]))
    for (const a of anchors) expect(['#about', '#experience', '#projects', '#education', '#contact']).toContain(a)
  })
})

it('pre-fills the email subject', () => {
  const email = DATA.social.find((s) => s.name === 'Email')!
  const url = new URL(email.url)
  expect(url.protocol).toBe('mailto:')
  expect(url.pathname).toBe('winstontrinh4@gmail.com')
  expect(url.searchParams.get('subject')).toBe('Website Inquiry')
  expect(url.searchParams.get('body')).toBe('Hi Winston,\r\n\r\n')
})

it('no longer lists Sandlines', () => {
  expect(DATA.experience.map((c) => c.company)).not.toContain('Sandlines')
})
