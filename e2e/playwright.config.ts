import { defineConfig, devices } from '@playwright/test';
import {
  API_PORT,
  API_URL,
  TEST_DATABASE_URL,
  WEB_PORT,
  WEB_URL,
} from './support/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  webServer: [
    {
      command: 'npx nest start --watch',
      cwd: '../api',
      url: `${API_URL}/api/health`,
      env: { PORT: String(API_PORT), DATABASE_URL: TEST_DATABASE_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      cwd: '../web',
      url: WEB_URL,
      env: { API_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
