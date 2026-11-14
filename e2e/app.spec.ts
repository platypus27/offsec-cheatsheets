import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

// axe samples rendered colours, so a dialog still fading in reads as low contrast.
async function settled(page: Page) {
  // allSettled: an animation that gets cancelled (e.g. a replaced transition) rejects `finished`.
  await page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
  )
}

async function openSearch(page: Page) {
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  return page.getByRole('combobox', { name: 'Search the cheatsheet' })
}

async function inViewport(page: Page, id: string) {
  return page.locator(`[id="${id}"]`).evaluate((element) => {
    const box = element.getBoundingClientRect()
    return box.top >= 0 && box.top < window.innerHeight
  })
}

async function stubClipboard(page: Page, mode: 'resolve' | 'reject') {
  await page.addInitScript((behaviour) => {
    const calls: string[] = []
    ;(window as unknown as { __copies: string[] }).__copies = calls
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          calls.push(text)
          return behaviour === 'resolve' ? Promise.resolve() : Promise.reject(new Error('denied'))
        },
      },
    })
  }, mode)
}

test('home identifies OSCP and the sidebar navigates', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle('OSCP Cheatsheet | OffSec')
  await expect(page.getByRole('heading', { level: 1, name: 'OSCP Cheatsheet' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('OSCP')
  if (isMobile(page)) {
    await page.setViewportSize({ width: 320, height: 780 })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(320)
  }
  if (isMobile(page)) await page.getByRole('button', { name: 'Open navigation' }).click()
  const nav = page.getByRole('navigation', { name: 'Cheatsheet sections' })
  await nav.getByRole('link', { name: 'Second Page' }).click()
  await expect(page).toHaveURL(/#\/beta\/second$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Second Page' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('OSCP')
  if (isMobile(page)) {
    await expect(nav).toBeHidden()
    await page.getByRole('button', { name: 'Open navigation' }).click()
  }
  await expect(nav.getByRole('link', { name: 'Second Page' })).toHaveAttribute('aria-current', 'page')
})

test('search jumps to the exact heading on another page', async ({ page }) => {
  await page.goto('./#/alpha/first')
  const input = await openSearch(page)
  await input.fill('quokka')
  const first = page.getByRole('option').first()
  await expect(first).toContainText('Zebra target')
  await expect(first).toContainText('Beta Section / Second Page')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/beta\/second\?h=zebra-target$/)
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
})

test('a cold load of a heading link scrolls to it', async ({ page }) => {
  await page.goto('./#/beta/second?h=zebra-target')
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
})

test('re-selecting the heading you are already on scrolls back to it', async ({ page }) => {
  await page.goto('./#/beta/second?h=zebra-target')
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const input = await openSearch(page)
  await input.fill('quokka')
  await page.keyboard.press('Enter')
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
})

test('on-this-page links are real routes that survive a new tab', async ({
  page,
  context,
  isMobile: mobile,
}) => {
  test.skip(mobile, 'the outline is shown on wide screens only')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('./#/beta/second')
  const link = page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'Zebra target' })
  await expect(link).toHaveAttribute('href', '#/beta/second?h=zebra-target')
  await link.click()
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
  const tab = await context.newPage()
  await tab.goto(new URL('#/beta/second?h=zebra-target', page.url()).href)
  await expect(tab.getByRole('heading', { level: 1, name: 'Second Page' })).toBeVisible()
})

test('opening the mobile navigation moves focus into it, pins or not', async ({ page, isMobile: mobile }) => {
  test.skip(!mobile, 'mobile drawer')
  await page.goto('./#/alpha/first')
  await page.getByRole('button', { name: 'Pin' }).click()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const nav = page.getByRole('navigation', { name: 'Cheatsheet sections' })
  await expect.poll(() => nav.evaluate((element) => element.contains(document.activeElement))).toBe(true)
})

test('in-content links route within the app', async ({ page }) => {
  await page.goto('./#/alpha/first')
  await page.getByRole('link', { name: 'the deep heading' }).click()
  await expect(page).toHaveURL(/#\/beta\/second\?h=zebra-target$/)
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
})

test('keyboard shortcuts open search and move between pages', async ({ page, isMobile: mobile }) => {
  test.skip(mobile, 'hardware keyboard shortcuts')
  await page.goto('./#/alpha/first')
  await page.keyboard.press('/')
  await expect(page.getByRole('combobox', { name: 'Search the cheatsheet' })).toBeFocused()
  await page.keyboard.press('Escape')
  await page.keyboard.press(']')
  await expect(page).toHaveURL(/#\/alpha\/extra$/)
  await page.keyboard.press('[')
  await expect(page).toHaveURL(/#\/alpha\/first$/)
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
})

test('variables fill commands and copy the filled-in text', async ({ page, browserName, context }) => {
  const realClipboard = browserName === 'chromium'
  if (realClipboard) await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  else await stubClipboard(page, 'resolve')
  await page.goto('./#/alpha/first')

  await page.getByRole('button', { name: /^Edit variables/ }).click()
  await page.getByRole('textbox', { name: 'RHOST' }).fill('10.9.8.7')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Target and variables' })).toBeHidden()

  const block = page.getByRole('region', { name: 'bash code' })
  await expect(block).toHaveText('connect --host 10.9.8.7 --port {{RPORT}}')
  await expect(block.locator('.var-unset')).toHaveText('{{RPORT}}')
  await expect(
    page.getByRole('button', { name: 'Edit variables, profile Box 1, target 10.9.8.7' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Copy code' }).click()
  await expect(page.getByText('Copied to clipboard', { exact: true })).toBeVisible()
  const copied = realClipboard
    ? await page.evaluate(() => navigator.clipboard.readText())
    : await page.evaluate(() => (window as unknown as { __copies: string[] }).__copies.at(-1))
  expect(copied).toBe('connect --host 10.9.8.7 --port {{RPORT}}')

  await page.reload()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.9.8.7 --port {{RPORT}}',
  )
})

test('a failed copy is reported, not hidden', async ({ page }) => {
  await stubClipboard(page, 'reject')
  await page.goto('./#/alpha/first')
  await page.getByRole('button', { name: 'Copy code' }).click()
  await expect(
    page.getByText('Could not copy - select the text and copy manually', { exact: true }),
  ).toBeVisible()
})

test('checklists and pins survive a reload', async ({ page }) => {
  await page.goto('./#/alpha/first')
  await page.getByRole('checkbox', { name: 'Step one' }).click()
  await expect(page.getByText('1 / 2 done')).toBeVisible()
  await page.getByRole('button', { name: 'Pin' }).click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Step one' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Step two' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Unpin' })).toBeVisible()
  await page.goto('./#/')
  await expect(
    page.getByRole('region', { name: 'Pinned' }).getByRole('link', { name: 'First Page' }),
  ).toBeVisible()

  await page.goto('./#/alpha/first')
  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByRole('checkbox', { name: 'Step one' })).not.toBeChecked()
})

test('dark mode toggles and persists', async ({ page }) => {
  await page.goto('./#/alpha/first')
  const html = page.locator('html')
  const wasDark = (await html.getAttribute('class'))?.includes('dark') ?? false
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/)
  await page.reload()
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/)
})

test('unknown routes show a not-found page', async ({ page }) => {
  await page.goto('./#/nope/missing')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

for (const scheme of ['light', 'dark'] as const) {
  test(`has no accessibility violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    for (const route of ['./', './#/alpha', './#/alpha/first']) {
      await page.goto(route)
      await expect(page.locator('#main-content')).toBeVisible()
      await settled(page)
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations, route).toEqual([])
    }
    const input = await openSearch(page)
    await input.fill('step')
    await expect(page.getByRole('option').first()).toBeVisible()
    await settled(page)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, 'search').toEqual([])
    await page.keyboard.press('Escape')
    if (isMobile(page)) await page.setViewportSize({ width: 320, height: 780 })
    await page.getByRole('button', { name: /^Edit variables/ }).click()
    await page.getByRole('tab', { name: 'Box 3', exact: true }).click()
    await settled(page)
    const profileResults = await new AxeBuilder({ page }).analyze()
    expect(profileResults.violations, 'variable profiles').toEqual([])
    if (isMobile(page)) {
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(320)
    }
  })
}

test('the single-file build works when opened from disk', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit blocks file:// storage in automation')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${pathToFileURL(resolve('dist-e2e/index.html')).href}#/beta/second?h=zebra-target`)
  await expect(page.getByRole('heading', { level: 1, name: 'Second Page' })).toBeVisible()
  await expect.poll(() => inViewport(page, 'zebra-target')).toBe(true)
  expect(errors).toEqual([])
})
