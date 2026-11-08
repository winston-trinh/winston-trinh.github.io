import { DATA } from '../data/resume'
import { buildIndex, search } from './searchIndex'

const index = buildIndex()

describe('site search', () => {
  it('finds the university, degree and date for "education"', () => {
    const [first] = search(index, 'education')
    expect(first.section).toBe('Education')
    expect(first.entries[0].title).toBe('University of Southern California')
    expect(first.entries[0].details).toContain('Degree: Bachelor of Science – Computer Science, December 2024')
  })

  it('lists every role for "experience", most recent first', () => {
    const [first] = search(index, 'Experience')
    expect(first.section).toBe('Experience')
    const roles = DATA.experience.flatMap((c) => c.roles.map((r) => r.title))
    expect(first.entries.map((e) => e.title)).toEqual(roles)
    expect(first.entries[0].subtitle).toBe('AT&T')
  })

  it('matches words anywhere in an entry, ignoring case', () => {
    const projects = search(index, 'spring BOOT').find((g) => g.section === 'Projects')
    expect(projects?.entries.map((e) => e.title)).toEqual(['JoesTable'])
  })

  it('needs every word to match', () => {
    expect(search(index, 'joestable lambda')).toEqual([])
  })

  it('returns nothing for an empty query', () => {
    expect(search(index, '   ')).toEqual([])
  })

  it('prefixes in-page anchors for other pages', () => {
    const usc = search(buildIndex('/'), 'southern')[0].entries[0]
    expect(usc.href).toBe('/#education')
  })
})

describe('easter egg', () => {
  const louise = (q: string) => search(index, q)[0]?.entries[0]?.title === 'Louise'

  it('shows Louise when someone asks about her', () => {
    for (const q of [
      'valentine', 'love', 'lover', 'wife', 'bubs', 'wubs', 'wubz', 'bubby', 'mooch', 'mooches', 'Moochacha',
      'gf', 'girlfriend', 'cuffed', 'is winston single?', 'is winston cuffed?', 'does winston have a gf?',
      'does winston have a girlfriend?', 'is winston married?', 'does winston have a bubby?', 'does winston have a bubs?',
    ]) {
      expect(louise(q), q).toBe(true)
    }
    const [egg] = search(index, 'girlfriend')
    expect(egg.label).toBe('Girlfriend · Bubby · Moochacha')
    expect(egg.entries[0].subtitle).toBe('UCLA Psychobiology ’26')
  })

  it('stays hidden from ordinary searches', () => {
    for (const q of ['ucla', 'psychobiology', 'winston', 'class of 2026', 'lovely', 'education']) {
      expect(louise(q), q).toBe(false)
    }
  })

  it('shows up mid-question when someone is clearly asking whether he is taken', () => {
    for (const q of [
      'is winston s', 'is winston i', 'is winston trinh s', 'is winston trinh i', 'does winston trinh have a g', 'is he in a r', 'is he in l', 'is he s', 'is he i', 'Is Winston si', 'is winston in', 'is winston in a rel',
      'is he seeing someone', 'is winston spoken for', 'is winston tak', 'is he mar', 'is winston dat',
      'does winston have a g', 'does he have a b', 'does winston have a girl', 'does he have gf', 'does winston have a par',
      'who is winston’s girlfriend', 'whos his gf', 'who is his bubby',
    ]) {
      expect(louise(q), q).toBe(true)
    }
  })

  it('lets go when the question turns out to be about something else', () => {
    for (const q of [
      'is winston', 'is winston ', 'is he', 'is winston smart', 'is winston in seattle', 'is winston a', 'is winston t',
      'is he m', 'does winston have a', 'does winston have a degree', 'does he have experience', 'who is winston',
      'who is winstons manager', 'is winston senior', 'is winston trinh', 'is winston trinh smart',
    ]) {
      expect(louise(q), q).toBe(false)
    }
  })
})
