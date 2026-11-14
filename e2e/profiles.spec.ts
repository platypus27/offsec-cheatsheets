import { expect, test, type Page } from '@playwright/test'

async function openVariables(page: Page) {
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  return page.getByRole('dialog', { name: 'Target and variables' })
}

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
