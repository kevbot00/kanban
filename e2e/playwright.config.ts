import { defineConfig, devices } from '@playwright/test';
import {
  API_PORT,
  API_URL,
  TEST_DATABASE_URL,
  WEB_PORT,
  WEB_URL,
} from './support/config';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: WEB_URL,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
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
