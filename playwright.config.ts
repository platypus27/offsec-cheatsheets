import { defineConfig, devices } from '@playwright/test'

const PORT = 4322

// The suite builds against fixed fixture content (not the real notes) so
// editing cheatsheets never breaks it.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Match CI locally: cold browser and accessibility checks share host resources.
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `vite build --outDir dist-e2e --emptyOutDir && vite preview --outDir dist-e2e --host 127.0.0.1 --port ${PORT} --strictPort`,
    env: { CHEATSHEET_CONTENT: 'e2e/fixtures/content' },
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
