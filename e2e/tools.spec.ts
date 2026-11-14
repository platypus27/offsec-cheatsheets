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

test('parsing a scan creates a target that fills commands', async ({ page }) => {
  await page.goto('./#/tools/parse')
  await page.getByRole('textbox', { name: 'Scan output' }).fill(scan)
  const host = page.getByRole('region', { name: 'zoo.lab (10.20.30.40)' })
  await expect(host.getByRole('table')).toContainText('8080/tcp')
  await expect(host.getByText('Alpha service')).toBeVisible()
  await expect(host.getByText('Fixture rule.')).toBeVisible()

  await host.getByRole('button', { name: 'Save and target' }).click()
  await expect(page).toHaveURL(/#\/tools\/targets\/t-/)
  await expect(page.getByRole('heading', { level: 1, name: 'zoo.lab' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clear active' })).toBeVisible()

  await page.getByRole('link', { name: 'First Page › Command block' }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.20.30.40 --port {{RPORT}}',
  )
  await expect(
    page.getByRole('button', { name: /^Edit variables, target zoo\.lab 10\.20\.30\.40$/ }),
  ).toBeVisible()

  await page.reload()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.20.30.40 --port {{RPORT}}',
  )
})

test('target variables override globals and clearing the target restores them', async ({ page }) => {
  await page.goto('./#/tools/targets')
  await page.getByRole('textbox', { name: 'Name' }).fill('DC01')
  await page.getByRole('textbox', { name: 'Address' }).fill('10.1.1.1')
  await page.getByRole('button', { name: 'Add target' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'DC01' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Add a target variable' }).fill('rport')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.getByRole('textbox', { name: 'RPORT' }).fill('8443')
  await page.getByRole('button', { name: 'Set active' }).click()

  await page.goto('./#/alpha/first')
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host 10.1.1.1 --port 8443',
  )

  await page.getByRole('button', { name: /^Edit variables/ }).click()
  await page.getByRole('combobox', { name: 'Active target' }).click()
  await page.getByRole('option', { name: 'No active target' }).click()
  await expect(page.getByRole('listbox')).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Target and variables' })).toBeHidden()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText(
    'connect --host {{RHOST}} --port {{RPORT}}',
  )
})

test('deleting a target asks first and clears it as active', async ({ page }) => {
  await page.goto('./#/tools/targets')
  await page.getByRole('textbox', { name: 'Address' }).fill('10.5.5.5')
  await page.getByRole('button', { name: 'Add target' }).click()
  await page.getByRole('button', { name: 'Set active' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page).toHaveURL(/#\/tools\/targets$/)
  await expect(page.getByText('No targets yet.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit variables', exact: true })).toBeVisible()
})

test('playbooks walk a path that the back button can retrace', async ({ page }) => {
  await page.goto('./#/')
  await openNav(page)
  await page
    .getByRole('navigation', { name: 'Cheatsheet sections' })
    .getByRole('link', { name: 'Playbooks' })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'OSCP playbooks' })).toBeVisible()
  await page.getByRole('link', { name: /Fixture route/ }).click()
  await expect(page.getByRole('heading', { name: 'Go left or right?' })).toBeVisible()
  await page.getByRole('button', { name: 'Left', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Left end' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('OSCP')
  await expect(page.getByText('End of this branch.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Second Page › Zebra target' })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Go left or right?' })).toBeVisible()
  await page.getByRole('button', { name: 'Right', exact: true }).click()
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
