import { expect, test } from '@playwright/test';

// baseURL 자체(=staging 루트)로 이동해야 하므로 './' 사용.
// Playwright 의 path 해석 규칙: '/' 로 시작하면 host-relative 가 되어
// baseURL 의 path 부분(/todo-sdlc/staging/)을 무시하고 호스트 루트로 간다 → 404.
const HOME = './';

test.describe('staging smoke', () => {
  test('홈 화면이 200 + 핵심 H1 + env 라벨 노출', async ({ page }) => {
    const response = await page.goto(HOME);
    expect(response?.status(), 'home should respond 200').toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Hello, Calendar Todo/i);
    await expect(page.getByTestId('app-env')).toHaveText(/env: \w+/);
  });

  test('정적 자산이 깨지지 않고 로드된다', async ({ page }) => {
    const failed: string[] = [];
    page.on('requestfailed', (req) => failed.push(`${req.url()} ${req.failure()?.errorText ?? ''}`));
    const response = await page.goto(HOME);
    expect(response?.status(), 'home should respond 200').toBe(200);
    await page.waitForLoadState('networkidle');
    expect(failed, `failed requests:\n${failed.join('\n')}`).toEqual([]);
  });
});
