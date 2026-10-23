import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { allGazeSrcs } from './gaze'

it('has a generated image on disk for every gaze cell', () => {
  const missing = allGazeSrcs().filter((src) => !existsSync(resolve(process.cwd(), 'public', '.' + src)))
  expect(missing).toEqual([])
})
