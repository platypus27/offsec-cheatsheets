import { expect, test, type Page } from '@playwright/test'

const scan = `Nmap scan report for zoo.lab (10.20.30.40)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6
8080/tcp open  quokka  Quokka 1.0
`

async function openNav(page: Page) {
  const toggle = page.getByRole('button', { name: 'Open navigation' })
  if (await toggle.isVisible()) await toggle.click()
}

test('parsing a scan loads the address and ports into the current profile', async ({ page }) => {
  await page.goto('./#/tools/parse')
  await page.getByRole('textbox', { name: 'Scan output' }).fill(scan)
  const host = page.getByRole('region', { name: 'zoo.lab (10.20.30.40)' })
  await expect(host.getByRole('table')).toContainText('8080/tcp')
  await expect(host.getByText('Alpha service')).toBeVisible()
  await expect(host.getByText('Fixture rule.')).toBeVisible()

  await host.getByRole('button', { name: 'Use in Box 1' }).click()
  await expect(page.getByText('10.20.30.40 loaded into Box 1', { exact: true })).toBeVisible()
  await page.goto('./#/alpha/first')
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.20.30.40 --port {{RPORT}}',
  )
  await expect(
    page.getByRole('button', { name: /^Edit variables, profile Box 1 \/ 10\.20\.30\.40$/ }),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.20.30.40 --port {{RPORT}}',
  )
  await expect(page.getByRole('link', { name: 'Targets', exact: true })).toHaveCount(0)
})

test('companions walk a path that the back button can retrace', async ({ page }) => {
  await page.goto('./#/')
  await openNav(page)
  await page
    .getByRole('navigation', { name: 'Cheatsheet sections' })
    .getByRole('link', { name: 'Companions' })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'OSCP companions' })).toBeVisible()
  await page.getByRole('link', { name: /Fixture route/ }).click()
  await expect(page.getByRole('heading', { name: 'Go left or right?' })).toBeVisible()
  await page.getByRole('button', { name: 'Left', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Left end' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('OSCP')
  await expect(page.getByText(/End of this branch/)).toBeVisible()
  await page.getByText('Open reference notes', { exact: true }).click()
  await expect(page.getByRole('link', { name: 'Second Page › Zebra target' })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Go left or right?' })).toBeVisible()
  await page.getByRole('button', { name: 'Right', exact: true }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Restart' }).click()
  await expect(page.getByRole('heading', { name: 'Go left or right?' })).toBeVisible()
})

test('encoders convert and chain', async ({ page }) => {
  await page.goto('./#/tools/encode')
  await page.getByRole('textbox', { name: 'Input' }).fill('whoami')
  await page.getByRole('button', { name: 'PowerShell -EncodedCommand', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Output' })).toHaveValue('dwBoAG8AYQBtAGkA')
  await page.getByRole('button', { name: 'Use output as input' }).click()
  await page.getByRole('button', { name: 'PowerShell -EncodedCommand decode' }).click()
  await expect(page.getByRole('textbox', { name: 'Output' })).toHaveValue('whoami')
  await page.getByRole('button', { name: 'Base64 decode' }).click()
  await page.getByRole('textbox', { name: 'Input' }).fill('@@@')
  await expect(page.getByText('Not valid Base64')).toBeVisible()
})

test('search finds tools', async ({ page }) => {
  await page.goto('./#/')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await page.getByRole('combobox', { name: 'Search the cheatsheet' }).fill('base64')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/tools\/encode$/)
})
