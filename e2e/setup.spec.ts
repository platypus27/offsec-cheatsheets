import { expect, test } from '@playwright/test'

test('setup copies exact fixed paths and persists manual progress', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          document.documentElement.dataset.copied = text
          return Promise.resolve()
        },
      },
    })
  })
  await page.goto('./#/setup')
  await expect(page.getByRole('heading', { level: 1, name: 'Set up your OSCP workspace' })).toBeVisible()
  const commands = page.getByRole('region', { name: 'OffSec Cheatsheets setup commands' })
  await expect(commands).toContainText('/home/kali/tools/offsec-cheatsheets')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.getByRole('button', { name: 'Copy section', exact: true }).click()
  expect(await page.locator('html').getAttribute('data-copied')).toContain(
    'git clone https://github.com/platypus27/offsec-cheatsheets.git /home/kali/tools/offsec-cheatsheets',
  )
  await page.getByRole('checkbox', { name: 'Mark complete' }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Complete' })).toBeChecked()
})

test('old playbook URLs redirect to companions and preserve their path', async ({ page }) => {
  await page.goto('./#/tools/playbooks/route?path=first.left')
  await expect(page).toHaveURL(/#\/companions\/route\?path=first\.left$/)
  await expect(page.getByRole('heading', { name: 'Left end' })).toBeVisible()
})
