import { mkdirSync } from 'node:fs';
import { test } from '@playwright/test';

const target = process.env.TARGET ?? 'baseline';
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const outDir = `e2e/${target}`;

const viewports = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];
const pages = ['dashboard', 'transactions', 'analytics', 'insights', 'afford'];

mkdirSync(outDir, { recursive: true });

for (const [name, viewport] of viewports) {
  test(`screens ${name}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, baseURL, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const shot = async (label) => {
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${outDir}/${label}-${name}.png`, fullPage: true, animations: 'disabled' });
    };

    await page.goto(process.env.LEGACY ? '/' : '/login');
    await page.getByRole('button', { name: 'Sign in' }).waitFor();
    await shot('login');
    await page.getByRole('button', { name: /Create an account/ }).click();
    await shot('register');
    await page.getByRole('button', { name: /Already have an account/ }).click();

    await page.getByLabel('Username').fill('demo');
    await page.getByLabel('Password').fill('FinSightDemo1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('heading', { name: 'Overview' }).waitFor();
    await page.waitForFunction(() => !document.body.innerText.includes('No expenses recorded'));
    await shot('dashboard');

    for (const [index, label] of pages.entries()) {
      if (index === 0) continue;
      await page.locator('nav > *').nth(index).click();
      await page.waitForTimeout(400);
      await shot(label);
    }
    await context.close();
  });
}
