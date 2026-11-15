import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function openVariables(page: Page) {
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  return page.getByRole('dialog', { name: 'Machine variables' })
}

test('legacy target values and ports migrate into Box 1 without exposing advanced fields', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('offsec-cheatsheets:variables')) return
    localStorage.setItem(
      'offsec-cheatsheets:variables',
      JSON.stringify({ RHOST: '192.0.2.10', RPORT: '22', USER: 'legacy-user' }),
    )
    localStorage.setItem('offsec-cheatsheets:active-target', JSON.stringify('legacy-target'))
    localStorage.setItem(
      'offsec-cheatsheets:targets',
      JSON.stringify([
        {
          id: 'legacy-target',
          name: 'Legacy host',
          address: '192.0.2.20',
          vars: { RPORT: '8443' },
          ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }],
          notes: 'Keep this note',
        },
      ]),
    )
  })
  await page.goto('./#/alpha/first')
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.20 --port 8443',
  )
  const dialog = await openVariables(page)
  await expect(dialog.getByRole('textbox', { name: 'IP address', exact: true })).toHaveValue('192.0.2.20')
  await expect(dialog.getByRole('textbox', { name: 'IP address', exact: true })).toBeEnabled()
  await expect(dialog.getByRole('textbox', { name: 'Username', exact: true })).toHaveValue('legacy-user')
  for (const name of ['RHOST', 'RPORT', 'DC', 'NTHASH', 'Add a variable']) {
    await expect(dialog.getByRole('textbox', { name, exact: true })).toHaveCount(0)
  }
  await expect(dialog.getByRole('link', { name: /targets/i })).toHaveCount(0)
  await dialog.getByRole('textbox', { name: 'Domain', exact: true }).fill('legacy.example')
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('offsec-cheatsheets:variable-profiles')!),
  )
  expect(stored.version).toBe(3)
  expect(stored.items.find((item: { id: string }) => item.id === 'box-1').ports[0].port).toBe(445)
})

test('profiles sync across tabs but remain separate in another browser session', async ({
  page,
  context,
  browser,
}) => {
  await page.goto('./#/alpha/first')
  const sameBrowserTab = await context.newPage()
  await sameBrowserTab.goto(page.url())
  const dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.33')
  await dialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(sameBrowserTab.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.33 --port {{RPORT}}',
  )

  const otherBrowser = await browser.newContext()
  try {
    const otherPage = await otherBrowser.newPage()
    await otherPage.goto(page.url())
    await expect(otherPage.getByRole('region', { name: 'bash code' })).toHaveText(
      'connect --host {{RHOST}} --port {{RPORT}}',
    )
    const otherDialog = await openVariables(otherPage)
    await expect(otherDialog.getByRole('status')).toHaveText('Commands use Box 1')
    await otherDialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
    await expect(otherDialog.getByRole('textbox', { name: 'IP address', exact: true })).toHaveValue('')
  } finally {
    await otherBrowser.close()
  }
})

test('machine profiles stay separate, renamable, and share My IP', async ({ page }) => {
  await page.goto('./#/alpha/first')
  let dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'MS01', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.10')
  await dialog.getByRole('textbox', { name: 'Domain', exact: true }).fill('training.invalid')
  await dialog.getByRole('textbox', { name: 'Username', exact: true }).fill('lab-user')
  await dialog.getByRole('textbox', { name: 'Password', exact: true }).fill('example-only')
  await dialog.getByRole('textbox', { name: 'My IP', exact: true }).fill('192.0.2.99')
  await dialog.getByRole('button', { name: 'Make MS01 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Add box', exact: true }).click()
  await expect(dialog.getByRole('tab', { name: 'Box 4', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(dialog.getByRole('textbox', { name: 'My IP', exact: true })).toHaveValue('192.0.2.99')
  await expect(dialog.getByRole('textbox', { name: 'My port', exact: true })).toHaveCount(0)
  for (const name of ['IP address', 'Domain', 'Username', 'Password']) {
    await expect(dialog.getByRole('textbox', { name, exact: true })).toHaveValue('')
  }
  await dialog.getByRole('textbox', { name: 'Profile name', exact: true }).fill('WEB02')
  await dialog.getByRole('textbox', { name: 'Profile name', exact: true }).press('Enter')
  await expect(dialog.getByRole('tab', { name: 'WEB02', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.44')
  await dialog.getByRole('button', { name: 'Make WEB02 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.44 --port {{RPORT}}',
  )
  await page.reload()
  dialog = await openVariables(page)
  await expect(dialog.getByRole('status')).toHaveText('Commands use WEB02')
  await dialog.getByRole('tab', { name: 'MS01', exact: true }).click()
  await expect(dialog.getByRole('textbox', { name: 'Domain', exact: true })).toHaveValue('training.invalid')
  await expect(dialog.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('example-only')
  await expect(dialog.getByRole('textbox', { name: 'My IP', exact: true })).toHaveValue('192.0.2.99')
})

test('making a box default switches filled and copied commands and survives reload', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  else {
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
  }
  await page.goto('./#/alpha/first')
  const dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.11')
  await dialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.33')
  await dialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  const command = page.getByRole('region', { name: 'bash code' })
  await expect(command).toHaveText('connect --host 192.0.2.33 --port {{RPORT}}')
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  const copied =
    browserName === 'chromium'
      ? await page.evaluate(() => navigator.clipboard.readText())
      : await page.locator('html').getAttribute('data-copied')
  expect(copied).toBe('connect --host 192.0.2.33 --port {{RPORT}}')
  await page.reload()
  await expect(command).toHaveText('connect --host 192.0.2.33 --port {{RPORT}}')
  await expect(page.getByRole('button', { name: /Edit variables, profile Box 3/ })).toBeVisible()
})

test('DC01 supplies DC without adding a field to other machine profiles', async ({ page }) => {
  await page.goto('./#/companions/guided')
  const dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'DC01', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.140')
  await dialog.getByRole('tab', { name: 'MS01', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.141')
  await expect(dialog.getByRole('textbox', { name: 'DC', exact: true })).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Make MS01 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await page.getByRole('checkbox', { name: 'LDAP', exact: true }).check()
  await expect(page.getByRole('region', { name: /bash code/ })).toContainText('nxc ldap 192.0.2.140')
})

test('variables dialog stays inside the viewport on a narrow screen without My port', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('./#/alpha/first')
  const dialog = await openVariables(page)
  await expect(dialog.getByRole('textbox', { name: 'My port', exact: true })).toHaveCount(0)
  const field = dialog.getByRole('textbox', { name: 'My IP', exact: true })
  await expect(field).toBeVisible()
  await page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
  )
  const fieldBox = await field.boundingBox()
  const dialogBox = await dialog.boundingBox()
  expect(fieldBox).not.toBeNull()
  expect(dialogBox).not.toBeNull()
  expect(fieldBox!.x).toBeGreaterThanOrEqual(dialogBox!.x)
  expect(fieldBox!.x + fieldBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width)
})
