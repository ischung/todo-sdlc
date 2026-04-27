import { expect, test } from '@playwright/test';
import { gotoFresh, panel } from './helpers';

test.describe('E2E · 다음 달 이동 + 미래 날짜 항목 추가 (F1/F8)', () => {
  test('다음 달의 1일 셀에 항목을 추가할 수 있다', async ({ page }) => {
    await gotoFresh(page);

    const headingBefore = await page.getByRole('heading', { level: 2 }).textContent();
    expect(headingBefore).toMatch(/\d{4}년 \d{1,2}월/);

    await page.getByTestId('next-month').click();

    const headingAfter = await page.getByRole('heading', { level: 2 }).textContent();
    expect(headingAfter).not.toBe(headingBefore);

    // 다음 달 1일 셀 (정확한 날짜를 모르므로 첫 번째 in-month 셀 선택)
    const firstOfMonth = page.locator('[role="gridcell"]:not([data-out-of-month])').first();
    await firstOfMonth.click();

    await panel(page).getByTestId('todo-input').fill('미래 약속');
    await panel(page).getByTestId('todo-input').press('Enter');

    await expect(panel(page).getByTestId('todo-title')).toHaveText('미래 약속');
  });
});
