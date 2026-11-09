import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in parallel, both across files and within each file */
  fullyParallel: true,

  /* Fail CI if a test.only was accidentally left in the code */
  forbidOnly: !!process.env.CI,

  /* Retry only in CI; locally, failures show up immediately */
  retries: process.env.CI ? 2 : 0,

  /* One worker in CI for stability; locally, Playwright picks based on CPU cores */
  workers: process.env.CI ? 1 : undefined,

  /* Default time limits (written out so they're easy to find and tune) */
  timeout: 30_000,
  expect: { timeout: 5_000 },

  /* Readable results in the terminal + an HTML report you open with `npm run report` */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* Shared settings for every test */
  use: {
    baseURL: 'https://www.saucedemo.com',
    /* Sauce Demo marks elements with data-test="...", so getByTestId() looks for that */
    testIdAttribute: 'data-test',
    /* Evidence when something fails */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Browsers to run against */
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});