import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests against the production build: Chrome and Safari on a laptop,
 * and Safari's engine as an iPhone. Run with `npm run e2e`; the first time,
 * `npx playwright install webkit` fetches Safari's engine. Chrome is the one
 * already installed on the computer.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    { name: 'iphone', use: { ...devices['iPhone 15 Pro'] } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
