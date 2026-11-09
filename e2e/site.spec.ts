import { expect, test, type Locator, type Page } from '@playwright/test'

const SECTIONS = ['about', 'experience', 'projects', 'education', 'contact']
const TABS = ['About', 'Experience', 'Projects', 'Education', 'Contact']

const touch = () => test.info().project.name === 'iphone'
/** A tap on the phone, a click everywhere else. */
const press = (l: Locator) => (touch() ? l.tap() : l.click())
const tabs = (page: Page) => page.getByRole('navigation', { name: 'Sections' }).locator('.lg-tab')
const current = (page: Page) => page.getByRole('navigation', { name: 'Sections' }).locator('.lg-tab[aria-current]')

/** The section's top has come to rest just under the floating bar. */
async function expectArrived(page: Page, id: string) {
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const top = document.getElementById(id)!.getBoundingClientRect().top
        const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2
        return Math.abs(top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 4 || atBottom
      }, id),
    )
    .toBe(true)
}

let errors: string[]
test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/')
})
test.afterEach(() => expect(errors).toEqual([]))

test('sections and tabs follow the page order', async ({ page }) => {
  expect(await page.locator('main > section').evaluateAll((s) => s.map((e) => e.id))).toEqual(['top', ...SECTIONS])
  await expect(tabs(page)).toHaveText(TABS)
})

test('a tab scrolls to its section and marks it', async ({ page }) => {
  for (const [i, id] of [[2, 'projects'], [3, 'education'], [1, 'experience']] as const) {
    await press(tabs(page).nth(i))
    await expectArrived(page, id)
    await expect(current(page)).toHaveText(TABS[i])
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
  }
})

test('tab links never underline', async ({ page }) => {
  test.skip(touch(), 'no hover on a phone')
  const tab = tabs(page).nth(1)
  await tab.hover()
  expect(await tab.evaluate((a) => getComputedStyle(a).textDecorationLine)).toBe('none')
})

test('opening search stops marking the current section', async ({ page }) => {
  await press(tabs(page).nth(2))
  await expectArrived(page, 'projects')
  await expect(current(page)).toHaveText('Projects')

  const box = page.getByRole('combobox', { name: /Search/ })
  await press(box)
  await expect(current(page)).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Sections' })).toHaveAttribute('data-hidden', '')

  // A typo still finds the degree, and choosing it goes there.
  await box.fill('educarion')
  await expect(page.getByText(/Did you mean/)).toBeVisible()
  await press(page.getByRole('option', { name: /University of Southern California/ }))
  await expectArrived(page, 'education')
  await expect(current(page)).toHaveText('Education')
})

test('Escape closes search and brings the mark back', async ({ page }) => {
  test.skip(touch(), 'no Escape key on a phone')
  await tabs(page).nth(2).click()
  await expectArrived(page, 'projects')
  await page.getByRole('combobox', { name: /Search/ }).click()
  await expect(current(page)).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(current(page)).toHaveText('Projects')
})

const pageOf = (l: Locator) => l.page()

/** Point at a sheet near its top, the part that peeks out above the one in front. */
async function pick(sheet: Locator) {
  const { height } = (await sheet.boundingBox())!
  const position = { x: 30, y: Math.round(height * 0.3) }
  await (touch() ? sheet.tap({ position }) : sheet.hover({ position }))
}

/** Open a folder the way a visitor would: point at it, or tap it on a phone. */
async function openFolder(folder: Locator) {
  // Low in the window, so the sheets have room to rise below the top bar (but, on a phone, the
  // flap stays clear of the tab bar along the bottom).
  await folder.evaluate((el, block) => el.scrollIntoView({ block, behavior: 'instant' }), (touch() ? 'center' : 'end') as ScrollLogicalPosition)
  if (touch()) await tapFlap(folder)
  else await folder.hover({ position: { x: 40, y: 40 } })
}

/**
 * The flap's bottom-right corner: always bare padding, so a press there opens or closes the
 * folder. (The open flap's links sit bottom-left; a tap on a sheet opens it too, but picks that sheet.)
 */
async function flapCorner(folder: Locator): Promise<[number, number]> {
  const b = (await folder.boundingBox())!
  return [b.x + b.width - 12, b.y + b.height - 14]
}

async function tapFlap(folder: Locator) {
  await pageOf(folder).touchscreen.tap(...(await flapCorner(folder)))
}

/** Click (or tap) the flap, which opens or closes the folder. */
async function pressFlap(folder: Locator) {
  if (touch()) return tapFlap(folder)
  await pageOf(folder).mouse.click(...(await flapCorner(folder)))
}

test('the AT&T folder holds both roles, newest in front', async ({ page }) => {
  const att = page.getByRole('article', { name: 'AT&T' })
  await openFolder(att)
  const newest = att.getByRole('button', { name: 'Show Sr. Specialist Member of Technical Staff' })
  const older = att.getByRole('button', { name: 'Show TDP Network Engineer' })
  await expect(att.getByRole('heading', { level: 4 })).toHaveText('Sr. Specialist Member of Technical Staff')
  await page.waitForTimeout(800)

  // Newest sits in front and rises least; the older one stacks above and behind it.
  const [n, o] = [(await newest.boundingBox())!, (await older.boundingBox())!]
  expect(n.y).toBeGreaterThan(o.y)
  expect(await onTop(newest)).toBe('Show Sr. Specialist Member of Technical Staff')

  // Pointing at (or tapping) the older role shows its accomplishments on the flap.
  await pick(older)
  await expect(att.getByRole('heading', { level: 4 })).toHaveText('TDP Network Engineer')
  const bullets = att.locator('[id^="folder-"] li')
  await expect(bullets.nth(1)).toHaveText('Promoted from TDP Network Engineer I to TDP Network Engineer II in August 2026.')
  await expect(att.getByRole('link', { name: 'AT&T' })).toHaveAttribute('href', /att\.jobs/)
})

/** Which sheet is painted on top where the given one overlaps the sheet behind it. */
async function onTop(sheet: Locator) {
  const b = (await sheet.boundingBox())!
  return sheet.page().evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label'), [b.x + b.width / 2, b.y + 14])
}

test('clicking a role at the back shuffles it to the front; clicking away puts it back', async ({ page }) => {
  const att = page.getByRole('article', { name: 'AT&T' })
  await openFolder(att)
  const newest = att.getByRole('button', { name: 'Show Sr. Specialist Member of Technical Staff' })
  const older = att.getByRole('button', { name: 'Show TDP Network Engineer' })
  await page.waitForTimeout(800)
  const { height } = (await older.boundingBox())!
  // Follow the sheet frame by frame: one continuous sweep, never pausing on the way.
  await older.evaluate((el) => {
    const w = window as unknown as { path: number[][] }
    w.path = []
    const t0 = performance.now()
    const tick = () => {
      const b = el.getBoundingClientRect()
      w.path.push([b.x, b.y])
      if (performance.now() - t0 < 700) requestAnimationFrame(tick)
    }
    el.addEventListener('pointerdown', () => requestAnimationFrame(tick), { once: true })
  })
  await (touch() ? older.tap({ position: { x: 30, y: height * 0.3 } }) : older.click({ position: { x: 30, y: height * 0.3 } }))
  await expect(older).toHaveAttribute('data-slot', '0')
  await page.waitForTimeout(800)
  const path = await page.evaluate(() => (window as unknown as { path: number[][] }).path)
  const steps = path.slice(1).map(([x, y], i) => Math.hypot(x - path[i][0], y - path[i][1]))
  const first = steps.findIndex((d) => d > 0.5)
  const last = steps.length - 1 - [...steps].reverse().findIndex((d) => d > 0.5)
  const stalls = steps.slice(first, last + 1).filter((d) => d < 0.2).length
  expect(last - first, 'frames in motion').toBeGreaterThan(8)
  expect(stalls, 'frames it stood still mid-shuffle').toBeLessThanOrEqual(1)
  await page.waitForTimeout(800)
  expect((await older.boundingBox())!.y).toBeGreaterThan((await newest.boundingBox())!.y)
  expect(await onTop(older)).toBe('Show TDP Network Engineer')
  await expect(att.getByRole('heading', { level: 4 })).toHaveText('TDP Network Engineer')

  // A click on the page background closes the folder and restores the order.
  await (touch() ? page.touchscreen.tap(4, 300) : page.mouse.click(4, 300))
  await expect(att).not.toHaveAttribute('data-open')
  await expect(newest).toHaveAttribute('data-slot', '0')
  await expect(older).toHaveAttribute('data-slot', '1')
})

test('folders pair up in staggered rows: left higher, right lower', async ({ page }) => {
  test.skip(touch(), 'one column on a phone')
  for (const id of ['experience', 'projects']) {
    const boxes = await page.locator(`#${id} article`).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top))
    for (let i = 0; i + 1 < boxes.length; i += 2) {
      const drop = boxes[i + 1] - boxes[i]
      expect(drop, `${id} row ${i / 2}`).toBeGreaterThan(60)
      expect(drop, `${id} row ${i / 2}`).toBeLessThan(120)
    }
  }
})

test('role sheets turn dark in dark mode', async ({ page }) => {
  const sheet = page.locator('#experience article').first().locator('button[aria-label^="Show"] > span').first()
  const paper = () => sheet.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(await paper()).toBe('rgb(255, 255, 255)')
  await press(page.getByRole('switch', { name: 'Dark mode' }))
  await expect.poll(paper).toBe('rgb(44, 44, 49)')
})

test('every folder’s details fit on its open flap', async ({ page }) => {
  for (const folder of await page.locator('#experience article, #projects article').all()) {
    const name = await folder.getAttribute('aria-label')
    // Opened by a click, so it stays open however the page scrolls while the sheets are picked.
    await folder.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await pressFlap(folder)
    await expect(folder).toHaveAttribute('data-open')
    const sheets = folder.getByRole('button', { name: /^Show / })
    const count = Math.max(1, await sheets.count())
    for (let i = 0; i < count; i++) {
      if ((await sheets.count()) > 0) {
        const { height } = (await sheets.nth(i).boundingBox())!
        const position = { x: 30, y: Math.round(height * 0.3) }
        await (touch() ? sheets.nth(i).tap({ position }) : sheets.nth(i).click({ position }))
      }
      await page.waitForTimeout(900)
      await expect(folder).toHaveAttribute('data-open')
      const overflow = await folder.evaluate((el) => {
        const info = el.querySelector('[id^="folder-"]')!
        const last = info.firstElementChild!.lastElementChild!
        return Math.round(last.getBoundingClientRect().bottom - info.getBoundingClientRect().bottom)
      })
      expect(overflow, `${name} #${i}`).toBeLessThanOrEqual(1)
    }
    await pressFlap(folder)
    await expect(folder).not.toHaveAttribute('data-open')
  }
})

test('skills scatter, then spread and swell under the pointer', async ({ page }) => {
  const cloud = page.getByRole('list', { name: 'Skills' })
  await cloud.scrollIntoViewIfNeeded()
  await expect(cloud.getByRole('listitem')).toHaveCount(24)
  await expect(cloud).not.toHaveAttribute('data-spread')
  const python = cloud.getByRole('listitem').filter({ hasText: /^Python$/ })
  // At rest the pills are tilted.
  expect(await python.evaluate((li) => getComputedStyle(li).transform)).not.toBe('none')

  await press(python)
  if (!touch()) await page.mouse.move(...(await center(python)))
  await expect(cloud).toHaveAttribute('data-spread')
  await expect(python).toHaveAttribute('data-near')
  await expect.poll(() => python.evaluate((li) => new DOMMatrix(getComputedStyle(li).transform).a)).toBeGreaterThan(1.2)

  // Away again, they settle back.
  if (touch()) await page.locator('#about h2').tap()
  else await page.mouse.move(5, 300)
  await expect(cloud).not.toHaveAttribute('data-spread')
})

test('a skill can be dragged around the cloud, never out of it, and the rest make room', async ({ page }) => {
  test.skip(touch(), 'press-and-hold drags need real touch input')
  const cloud = page.getByRole('list', { name: 'Skills' })
  await cloud.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const order = () => cloud.getByRole('listitem').allTextContents()
  const first = (await order())[0]
  const pill = cloud.getByRole('listitem').filter({ hasText: new RegExp(`^${first.replace(/[+]/g, '\\+')}$`) })
  const area = (await cloud.boundingBox())!
  await page.mouse.move(...(await center(pill)))
  await page.mouse.down()
  // Pulled far past the bottom right corner, it stops at the edge of the cloud.
  await page.mouse.move(area.x + area.width + 300, area.y + area.height + 300, { steps: 12 })
  const held = (await pill.boundingBox())!
  expect(held.x + held.width).toBeLessThanOrEqual(area.x + area.width + 20)
  expect(held.y + held.height).toBeLessThanOrEqual(area.y + area.height + 20)
  // Still held, and the others have already moved out of its way.
  await expect.poll(async () => (await order()).indexOf(first)).toBeGreaterThan(10)
  await page.mouse.up()
  await expect.poll(async () => (await order()).indexOf(first)).toBeGreaterThan(10)
  expect((await order()).slice().sort()).toEqual((await order()).sort())
  expect(await order()).toHaveLength(24)
})

async function center(l: Locator): Promise<[number, number]> {
  const b = (await l.boundingBox())!
  return [b.x + b.width / 2, b.y + b.height / 2]
}

test('the dark-mode switch flips the theme', async ({ page }) => {
  await press(page.getByRole('switch', { name: 'Dark mode' }))
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('the page never scrolls sideways', async ({ page }) => {
  for (const id of SECTIONS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  }
})

test('the blog’s tabs lead back to homepage sections', async ({ page }) => {
  await page.goto('/blog/building-a-portfolio-that-looks-back/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Building a portfolio that looks back at you')
  await expect(tabs(page).nth(2)).toHaveAttribute('href', '/#projects')
  await press(tabs(page).nth(2))
  await expect(page).toHaveURL(/\/#projects$/)
  await expectArrived(page, 'projects')
})
