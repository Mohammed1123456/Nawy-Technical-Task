import { defineConfig, devices } from '@playwright/test';
import environmentData from './data/environment/environment-data';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The public demo site throttles bursts of traffic, so keep parallelism modest
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 2,
  timeout: 60000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'html-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  use: {
    baseURL: environmentData.baseUrl,
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: environmentData.headless,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  outputDir: 'test-results/artifacts',

  expect: {
    timeout: 15000,
  },
});
