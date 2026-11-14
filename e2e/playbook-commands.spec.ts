import { expect, test } from '@playwright/test'

test('service choices reveal only selected commands and survive Back and reload for the current host', async ({
  page,
}) => {
  await page.goto('./#/tools/playbooks/guided')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  let dialog = page.getByRole('dialog', { name: 'Target and variables' })
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.20')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'SMB', exact: true }).check()
  await page.getByRole('checkbox', { name: 'WinRM', exact: true }).check()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveCount(2)
  await expect(page.getByRole('region', { name: 'bash code' }).first()).toContainText('nxc smb 192.0.2.20')
  await expect(page.getByRole('region', { name: 'bash code' }).last()).toContainText('nxc winrm 192.0.2.20')
  await expect(page.getByText('nxc ldap', { exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'WinRM', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'LDAP', exact: true })).not.toBeChecked()
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Target and variables' })
  await dialog.getByRole('tab', { name: 'Box 2', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 2 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveCount(0)
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Target and variables' })
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 1 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
})

test('playbook steps show and copy the current target command before moving on', async ({
  page,
  browserName,
  context,
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
  await page.goto('./#/tools/playbooks/guided')
  await expect(page.getByRole('heading', { name: 'Run Nmap first', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText('nmap -sV {{RHOST}}')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Target and variables' })
  await dialog.getByRole('textbox', { name: 'RHOST', exact: true }).fill('192.0.2.20')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText('nmap -sV 192.0.2.20')
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  const copied =
    browserName === 'chromium'
      ? await page.evaluate(() => navigator.clipboard.readText())
      : await page.locator('html').getAttribute('data-copied')
  expect(copied).toBe('nmap -sV 192.0.2.20')
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText('nxc smb 192.0.2.20')
  await page.reload()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText('nxc smb 192.0.2.20')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByRole('region', { name: 'bash code' })).toHaveText('nmap -sV 192.0.2.20')
})
