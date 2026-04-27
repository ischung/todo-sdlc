import { expect, test } from '@playwright/test';

test.describe('staging smoke', () => {
  test('홈 화면이 200 + 핵심 H1 + env 라벨 노출', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status(), 'home should respond 200').toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Hello, Calendar Todo/i);
    await expect(page.getByTestId('app-env')).toHaveText(/env: \w+/);
  });

  test('정적 자산이 깨지지 않고 로드된다', async ({ page }) => {
    const failed: string[] = [];
    page.on('requestfailed', (req) => failed.push(`${req.url()} ${req.failure()?.errorText ?? ''}`));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(failed, `failed requests:\n${failed.join('\n')}`).toEqual([]);
  });
});
