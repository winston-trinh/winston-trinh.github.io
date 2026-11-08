import { POSTS, postUrl } from '../blog/posts'
import { DATA } from '../data/resume'

export type SearchSection = 'About' | 'Skills' | 'Experience' | 'Education' | 'Projects' | 'Contact' | 'Blog'

export interface SearchEntry {
  section: SearchSection
  title: string
  subtitle?: string
  details: string[]
  /** Where choosing it goes. Without one, choosing it just closes search. */
  href?: string
  /** Draws a small heart beside the title. */
  heart?: boolean
  /** Extra words that should find this entry without being shown. */
  keywords: string
}

export interface SearchGroup {
  section: SearchSection
  /** Shown instead of the section name. */
  label?: string
  entries: SearchEntry[]
}

/** Section order on the page; groups come back in this order unless a query names one. */
export const SECTIONS: SearchSection[] = ['About', 'Skills', 'Experience', 'Education', 'Projects', 'Contact', 'Blog']

const SECTION_WORDS: Record<SearchSection, string> = {
  About: 'about bio me who hometown location',
  Skills: 'skills languages tools tech stack',
  Experience: 'experience work jobs career roles employment',
  Education: 'education school university college degree studied',
  Projects: 'projects built portfolio apps side',
  Contact: 'contact reach social links hire',
  Blog: 'blog posts writing articles',
}

const stripMarkdown = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

/** Every searchable thing on the site, in page order. `home` prefixes in-page anchors (e.g. '/' on the blog). */
export function buildIndex(home = ''): SearchEntry[] {
  const anchor = (id: string) => `${home}#${id}`
  const entries: SearchEntry[] = []

  entries.push({
    section: 'About',
    title: `About ${DATA.name.split(' ')[0]}`,
    subtitle: DATA.location,
    details: DATA.summary.map(stripMarkdown),
    href: anchor('about'),
    keywords: DATA.description,
  })

  entries.push({
    section: 'Skills',
    title: 'Skills',
    details: [DATA.skills.join(' · ')],
    href: anchor('about'),
    keywords: '',
  })

  for (const company of DATA.experience) {
    for (const role of company.roles) {
      entries.push({
        section: 'Experience',
        title: role.title,
        subtitle: company.company,
        details: [`${role.location} · ${role.start} – ${role.end}`, ...role.bullets],
        href: anchor('experience'),
        keywords: '',
      })
    }
  }

  for (const school of DATA.education) {
    entries.push({
      section: 'Education',
      title: school.school,
      subtitle: 'Education',
      details: [`Degree: ${school.degree}, ${school.end}`, school.description],
      href: anchor('education'),
      keywords: '',
    })
  }

  for (const project of DATA.projects) {
    entries.push({
      section: 'Projects',
      title: project.title,
      subtitle: project.dates,
      details: [project.description, project.technologies.join(' · ')],
      href: anchor('projects'),
      keywords: '',
    })
  }

  for (const link of DATA.social) {
    entries.push({
      section: 'Contact',
      title: link.label,
      subtitle: link.name === 'Email' ? 'winstontrinh4@gmail.com' : link.url.replace(/^https?:\/\//, ''),
      details: [],
      href: link.url,
      keywords: link.name,
    })
  }

  for (const post of POSTS) {
    entries.push({
      section: 'Blog',
      title: post.title,
      subtitle: post.date,
      details: [post.dek],
      href: postUrl(post.slug),
      keywords: '',
    })
  }

  return entries
}

/**
 * A little easter egg, for Louise. It isn't part of the index, so ordinary
 * searches (even "ucla") never find it. Only asking about her does.
 */
const EASTER_EGG: SearchGroup = {
  section: 'About',
  label: 'Girlfriend · Bubby · Moochacha',
  entries: [
    {
      section: 'About',
      title: 'Louise',
      subtitle: 'UCLA Psychobiology ’26',
      details: [],
      heart: true,
      keywords: '',
    },
  ],
}

const EASTER_EGG_WORDS = new Set([
  'valentine', 'valentines', 'love', 'lover', 'lovers', 'wife', 'gf', 'girlfriend', 'girlfriends',
  'bubs', 'bub', 'wubs', 'wubz', 'bubby', 'bubbie', 'mooch', 'mooches', 'moochacha', 'louise',
  'cuffed', 'single', 'married', 'taken', 'dating', 'relationship',
])

/**
 * Questions that are almost certainly about his relationship status, matched
 * as they're typed: "is winston s…" (single, seeing someone), "is he i…" (in a
 * relationship), "does winston have a g…" (girlfriend). Each pattern is a list
 * of slots; every typed word must fill its slot, and the word still being
 * typed only has to be the start of one. The card shows once the slot at
 * `from` is reached, and stops showing if the question turns elsewhere
 * ("is winston smart", "is winston in seattle").
 */
type Slot = string[]
interface Pattern {
  slots: Slot[]
  from: number
}

const SUBJECT = ['winston', 'he']
const PARTNER = [
  'girlfriend', 'gf', 'bubby', 'bubs', 'bub', 'wubs', 'wubz', 'partner', 'wife', 'significant', 'crush',
  'valentine', 'lover', 'boo', 'bae', 'mooch', 'moochacha', 'special',
]
const STATUS = ['single', 'seeing', 'spoken', 'in', 'taken', 'married', 'cuffed', 'dating', 'engaged', 'available', 'together']

const BASE_PATTERNS: Pattern[] = [
  { slots: [['is'], SUBJECT, STATUS], from: 2 },
  { slots: [['is'], SUBJECT, ['in'], ['a', 'love', 'relationship']], from: 2 },
  { slots: [['is'], SUBJECT, ['in'], ['a'], ['relationship']], from: 2 },
  { slots: [['is'], SUBJECT, ['seeing', 'dating', 'with'], ['someone', 'anyone', 'somebody', 'anybody', 'her']], from: 2 },
  { slots: [['is'], SUBJECT, ['spoken'], ['for']], from: 2 },
  { slots: [['does', 'do'], SUBJECT, ['have', 'has'], ['a', 'an'], PARTNER], from: 4 },
  { slots: [['does', 'do'], SUBJECT, ['have', 'has'], PARTNER], from: 3 },
  { slots: [['who', 'whos'], ['is', 'winstons', 'his'], ['winstons', 'his', ...PARTNER], PARTNER], from: 3 },
  { slots: [['whos'], ['winstons', 'his'], PARTNER], from: 2 },
]

/** Every "winston …" question also works with his full name: "is winston trinh s…". */
const PATTERNS: Pattern[] = BASE_PATTERNS.flatMap((p) =>
  p.slots[1] === SUBJECT
    ? [p, { slots: [p.slots[0], ['winston'], ['trinh'], ...p.slots.slice(2)], from: p.from + 1 }]
    : [p],
)

/** Words the relationship questions use, so the typo checker knows them ("gff" → "gf"). */
export const EASTER_EGG_VOCABULARY = new Set([...EASTER_EGG_WORDS, ...PATTERNS.flatMap((p) => p.slots.flat()), 'trinh'])

/** Letters needed before a half-typed word counts: "is winston s" already means single. */
const minLetters = (word: string) => (/^(single|seeing|spoken|in|relationship|love|girlfriend|gf|bubby|bubs|bub)$/.test(word) ? 1 : 3)

function asksAboutRelationship(query: string): boolean {
  const q = normalize(query)
  const words = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const typing = /[a-z0-9]$/.test(q) // the last word may be unfinished
  return PATTERNS.some(({ slots, from }) => {
    if (words.length <= from || words.length > slots.length) return false
    return words.every((w, i) => {
      if (i === words.length - 1 && typing) return slots[i].some((s) => s.startsWith(w) && w.length >= Math.min(s.length, minLetters(s)))
      return slots[i].includes(w)
    })
  })
}

/** "is winston single?", "does winston have a bubby?", "mooches"… */
export function isEasterEgg(query: string): boolean {
  if (asksAboutRelationship(query)) return true
  return normalize(query)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .some((w) => EASTER_EGG_WORDS.has(w))
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')

/**
 * Instant, dependency-free search. Every word of the query must appear in the
 * entry (title, subtitle, details, keywords or its section's name). Results are
 * grouped by section, keeping page order inside each group so experience reads
 * newest first; groups whose titles match best come first.
 */
export function search(index: SearchEntry[], query: string): SearchGroup[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const egg = isEasterEgg(query) ? [EASTER_EGG] : []

  const scored = new Map<SearchSection, { best: number; entries: SearchEntry[] }>()
  for (const entry of index) {
    const title = normalize(`${entry.title} ${entry.subtitle ?? ''}`)
    const section = normalize(`${entry.section} ${SECTION_WORDS[entry.section]}`)
    const body = normalize(`${entry.details.join(' ')} ${entry.keywords}`)
    let score = 0
    let all = true
    for (const w of words) {
      if (title.includes(w)) score += 3
      else if (section.includes(w)) score += 2
      else if (body.includes(w)) score += 1
      else {
        all = false
        break
      }
    }
    if (!all) continue
    const group = scored.get(entry.section) ?? { best: 0, entries: [] }
    group.best = Math.max(group.best, score)
    group.entries.push(entry)
    scored.set(entry.section, group)
  }

  return [
    ...egg,
    ...SECTIONS.filter((s) => scored.has(s))
      .map((section) => ({ section, ...scored.get(section)! }))
      .sort((a, b) => b.best - a.best || SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section))
      .map(({ section, entries }) => ({ section, entries })),
  ]
}
