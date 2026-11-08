import { DATA } from '../data/resume'
import { EASTER_EGG_VOCABULARY, isEasterEgg, normalize, SECTIONS, type SearchEntry } from './searchIndex'

/* ---------------------------------------------------------------------------
 * Autocomplete: the grey "ghost" text after what you've typed. Tab accepts it.
 * ------------------------------------------------------------------------- */

const SUBJECTS = ['winston', 'winston trinh', 'he']
const POSSESSIVES = ['winston’s', 'winston trinh’s', 'his']

/** Relationship questions, most likely first: "is winston s" → "is winston single?". */
const QUESTIONS = [
  ...SUBJECTS.flatMap((s) => [
    `is ${s} single?`,
    `is ${s} in a relationship?`,
    `is ${s} seeing someone?`,
    `is ${s} spoken for?`,
    `is ${s} taken?`,
    `is ${s} married?`,
    `is ${s} cuffed?`,
    `is ${s} dating anyone?`,
    `does ${s} have a girlfriend?`,
    `does ${s} have a bubby?`,
  ]),
  ...POSSESSIVES.map((p) => `who is ${p} girlfriend?`),
]

/** Things worth completing to, in the order they should win: sections, then names on the page. */
function phrases(): string[] {
  const list = [
    ...SECTIONS.map((s) => s.toLowerCase()),
    ...DATA.experience.flatMap((c) => [c.company, ...c.roles.map((r) => r.title)]),
    ...DATA.education.map((e) => e.school),
    ...DATA.projects.map((p) => p.title),
    ...DATA.skills,
    ...DATA.social.map((s) => s.label),
  ]
  return [...new Set(list)]
}

// Compare ignoring case and apostrophe style, so "who is winston's g" still completes.
const fold = (s: string) => s.toLowerCase().replace(/’/g, "'")

/**
 * The completion for what's typed so far, or null. Returned whole; the part
 * after the typed text is what shows as ghost text.
 */
export function complete(query: string): string | null {
  // Only mid-word: after a space there's no telling what comes next.
  if (!/\S$/.test(query)) return null
  const typed = fold(query.trimStart())
  if (typed.length < 2) return null
  const lead = query.slice(0, query.length - query.trimStart().length)
  // Finish a relationship question only once it's clearly one ("is winston s…", not "is winston").
  const candidates = isEasterEgg(query) ? [...QUESTIONS, ...phrases()] : phrases()
  for (const candidate of candidates) {
    const c = fold(candidate)
    if (c.length > typed.length && c.startsWith(typed)) return lead + query.trimStart() + candidate.slice(typed.length)
  }
  return null
}

/* ---------------------------------------------------------------------------
 * "Did you mean …?": fixing fat-fingered typos ("educarion", "gff").
 * ------------------------------------------------------------------------- */

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY = new Map<string, [number, number]>()
ROWS.forEach((row, r) => [...row].forEach((ch, c) => KEY.set(ch, [r, c + r * 0.5])))

/** Hitting a neighbouring key is a cheaper mistake than a random wrong letter. */
function substitution(a: string, b: string): number {
  const ka = KEY.get(a)
  const kb = KEY.get(b)
  if (ka && kb && Math.hypot(ka[0] - kb[0], ka[1] - kb[1]) < 1.6) return 0.6
  return 1
}

/** Edit distance with swapped neighbours ("eductaion") counted as one slip. */
export function typoDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : substitution(a[i - 1], b[j - 1])
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/** How many slips a word of this length may have and still be recognised. */
const allowance = (len: number) => (len <= 4 ? 1 : len <= 7 ? 1.6 : 2.2)

/** Every word the site knows: what's on the page, plus the words its questions use. */
export function vocabulary(index: SearchEntry[]): Set<string> {
  const words = new Set<string>(EASTER_EGG_VOCABULARY)
  const text = index.map((e) => [e.section, e.title, e.subtitle ?? '', ...e.details, e.keywords].join(' ')).join(' ')
  const all = `${text} ${SECTIONS.join(' ')} experience education projects skills contact blog about winston trinh`
  for (const w of normalize(all).split(/[^a-z0-9+#]+/)) if (w.length >= 2) words.add(w)
  return words
}

/**
 * The query with its misspelt words fixed, or null if nothing needed fixing.
 * A word is left alone if the site knows it, or if it's the start of a word
 * the site knows (it may still be being typed).
 */
export function correct(query: string, vocab: Set<string>): string | null {
  const known = [...vocab]
  let changed = false
  const fixed = query.replace(/[A-Za-z’']+/g, (raw) => {
    const w = normalize(raw)
    if (w.length < 2 || vocab.has(w) || known.some((k) => k.startsWith(w))) return raw
    let best: string | null = null
    let bestScore = Infinity
    for (const k of known) {
      if (Math.abs(k.length - w.length) > 2) continue
      const score = typoDistance(w, k)
      if (score < bestScore || (score === bestScore && best !== null && k.length > best.length)) {
        best = k
        bestScore = score
      }
    }
    if (best === null || bestScore > allowance(w.length)) return raw
    changed = true
    return raw === raw.toUpperCase() && raw.length > 1 ? best.toUpperCase() : best
  })
  return changed ? fixed : null
}
