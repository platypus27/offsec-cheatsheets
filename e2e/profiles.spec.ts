import { expect, test, type Page } from '@playwright/test'

async function openVariables(page: Page) {
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  return page.getByRole('dialog', { name: 'Target and variables' })
}

test('existing values and saved targets are preserved in Box 1 after upgrading', async ({ page }) => {
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
          ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'Example SSH' }],
          notes: 'Keep this note',
        },
      ]),
    )
  })
  await page.goto('./#/alpha/first')
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.20 --port 8443',
  )
  let dialog = await openVariables(page)
  await expect(dialog.getByRole('textbox', { name: 'RHOST', exact: true })).toHaveValue('192.0.2.20')
  await expect(dialog.getByRole('textbox', { name: 'RHOST', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('textbox', { name: 'USER', exact: true })).toHaveValue('legacy-user')
  await dialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.33')
  await dialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.33 --port {{RPORT}}',
  )
  dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 1 default', exact: true }).click()
  await dialog.getByRole('link', { name: 'Edit saved target', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Legacy host' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue('Keep this note')
  await expect(page.getByRole('table')).toContainText('22/tcp')
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click()
  dialog = await openVariables(page)
  await expect(dialog.getByRole('textbox', { name: 'RHOST', exact: true })).toBeEnabled()
  await expect(dialog.getByRole('textbox', { name: 'RHOST', exact: true })).toHaveValue('192.0.2.10')
  await expect(dialog.getByRole('textbox', { name: 'RPORT', exact: true })).toHaveValue('22')
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
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.33')
  await dialog.getByRole('textbox', { name: 'RPORT', exact: true }).fill('443')
  await dialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(sameBrowserTab.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.33 --port 443',
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
    await expect(otherDialog.getByRole('textbox', { name: 'RHOST', exact: true })).toHaveValue('')
    await otherDialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.99')
    await otherDialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
    await otherDialog.getByRole('button', { name: 'Close', exact: true }).click()
    await otherPage.reload()
    await expect(otherPage.getByRole('region', { name: 'bash code' })).toHaveText(
      'connect --host 192.0.2.99 --port {{RPORT}}',
    )
    await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
      'connect --host 192.0.2.33 --port 443',
    )
  } finally {
    await otherBrowser.close()
  }
})

test('AD values stay separate when another box is added and made default', async ({ page }) => {
  await page.goto('./#/alpha/first')
  let dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'AD', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.10')
  await dialog.getByRole('textbox', { name: 'DOMAIN', exact: true }).fill('training.invalid')
  await dialog.getByRole('textbox', { name: 'DC', exact: true }).fill('192.0.2.1')
  await dialog.getByRole('textbox', { name: 'USER', exact: true }).fill('lab-user')
  await dialog.getByRole('textbox', { name: 'PASS', exact: true }).fill('example-only')
  await dialog.getByRole('textbox', { name: 'Add a variable', exact: true }).fill('wordlist')
  await dialog.getByRole('button', { name: 'Add', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'WORDLIST', exact: true }).fill('ad-users.txt')
  await dialog.getByRole('button', { name: 'Make AD default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Add box', exact: true }).click()
  await expect(dialog.getByRole('tab', { name: 'Box 4', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  for (const name of ['RHOST', 'DOMAIN', 'DC', 'USER', 'PASS']) {
    await expect(dialog.getByRole('textbox', { name, exact: true })).toHaveValue('')
  }
  await expect(dialog.getByRole('textbox', { name: 'WORDLIST', exact: true })).toHaveCount(0)
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.44')
  await dialog.getByRole('button', { name: 'Make Box 4 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 192.0.2.44 --port {{RPORT}}',
  )
  await page.reload()
  dialog = await openVariables(page)
  await expect(dialog.getByRole('status')).toHaveText('Commands use Box 4')
  await dialog.getByRole('tab', { name: 'AD', exact: true }).click()
  await expect(dialog.getByRole('textbox', { name: 'DOMAIN', exact: true })).toHaveValue('training.invalid')
  await expect(dialog.getByRole('textbox', { name: 'PASS', exact: true })).toHaveValue('example-only')
  await expect(dialog.getByRole('textbox', { name: 'WORDLIST', exact: true })).toHaveValue('ad-users.txt')
  await dialog.getByRole('button', { name: 'Remove WORDLIST', exact: true }).click()
  await expect(dialog.getByRole('textbox', { name: 'WORDLIST', exact: true })).toHaveCount(0)
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
  let dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.11')
  await dialog.getByRole('textbox', { name: 'RPORT', exact: true }).fill('22')
  await dialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.33')
  await dialog.getByRole('textbox', { name: 'RPORT', exact: true }).fill('443')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  const command = page.getByRole('region', { name: 'bash code' })
  await expect(command).toHaveText('connect --host 192.0.2.11 --port 22')

  dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 3', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 3 default', exact: true }).click()
  await expect(dialog.getByRole('status')).toHaveText('Commands use Box 3')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(command).toHaveText('connect --host 192.0.2.33 --port 443')
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  const copied =
    browserName === 'chromium'
      ? await page.evaluate(() => navigator.clipboard.readText())
      : await page.locator('html').getAttribute('data-copied')
  expect(copied).toBe('connect --host 192.0.2.33 --port 443')

  await page.reload()
  await expect(command).toHaveText('connect --host 192.0.2.33 --port 443')
  await expect(page.getByRole('button', { name: /Edit variables, profile Box 3/ })).toBeVisible()
  dialog = await openVariables(page)
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await expect(dialog.getByRole('textbox', { name: 'RHOST', exact: true })).toHaveValue('192.0.2.11')
  await dialog.getByRole('button', { name: 'Make Box 1 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(command).toHaveText('connect --host 192.0.2.11 --port 22')
})
