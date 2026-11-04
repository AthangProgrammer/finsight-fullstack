import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.spec.js',
  workers: 1,
  reporter: 'list',
  use: { browserName: 'chromium' },
});
