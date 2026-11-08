import { buildIndex, isEasterEgg, search } from './searchIndex'
import { complete, correct, typoDistance, vocabulary } from './suggest'

const index = buildIndex()
const vocab = vocabulary(index)

describe('autocomplete', () => {
  it('finishes a relationship question once it is clearly one', () => {
    expect(complete('is winston s')).toBe('is winston single?')
    expect(complete('is winston trinh s')).toBe('is winston trinh single?')
    expect(complete('is he i')).toBe('is he in a relationship?')
    expect(complete('Does Winston have a g')).toBe('Does Winston have a girlfriend?')
    expect(complete("who is winston's g")).toBe("who is winston's girlfriend?")
  })

  it('completes sections and names on the page, keeping what was typed', () => {
    expect(complete('edu')).toBe('education')
    expect(complete('Exp')).toBe('Experience')
    expect(complete('joes')).toBe('joesTable')
    expect(complete('  pyth')).toBe('  python')
  })

  it('stays quiet when there is nothing sure to suggest', () => {
    for (const q of ['', 'e', 'is', 'is winston', 'is winston ', 'is winston smart', 'zzz', 'education']) {
      expect(complete(q), q).toBeNull()
    }
  })
})

describe('did you mean', () => {
  it('treats a neighbouring key as a smaller slip than a random one', () => {
    expect(typoDistance('educarion', 'education')).toBeLessThan(typoDistance('educaxion', 'education'))
    expect(typoDistance('eductaion', 'education')).toBe(1)
  })

  it('fixes fat-fingered words', () => {
    expect(correct('educationn', vocab)).toBe('education')
    expect(correct('educarion', vocab)).toBe('education')
    expect(correct('eductaion', vocab)).toBe('education')
    expect(correct('experiance', vocab)).toBe('experience')
    expect(correct('pyhton', vocab)).toBe('python')
    expect(correct('does winston have a gff', vocab)).toBe('does winston have a gf')
    expect(correct('is winston singel?', vocab)).toBe('is winston single?')
  })

  it('leaves real words and half-typed words alone', () => {
    for (const q of ['education', 'educat', 'joestable', 'is winston', 'spring boot', 'xqzvbn']) {
      expect(correct(q, vocab), q).toBeNull()
    }
  })

  it('the corrected question finds Louise', () => {
    const fixed = correct('does winston have a gff', vocab)!
    expect(isEasterEgg('does winston have a gff')).toBe(false)
    expect(search(index, fixed)[0].entries[0].title).toBe('Louise')
  })
})
