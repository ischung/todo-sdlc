import { expect, test } from '@playwright/test';
import { gotoFresh, todayCell } from './helpers';

test.describe('E2E · 9+ 배지 표시 (F5)', () => {
  test('미완료 항목이 10개를 넘으면 셀 배지가 9+ 로 표시된다', async ({ page }) => {
    await gotoFresh(page);

    // 직접 localStorage 에 12개 시드 → 새로고침
    await page.evaluate(() => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;
      const items = Array.from({ length: 12 }, (_, i) => ({
        id: String(i),
        date,
        title: `t${i}`,
        done: false,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      }));
      window.localStorage.setItem(
        'todo-sdlc/v1',
        JSON.stringify({ schemaVersion: 1, todosByDate: { [date]: items } }),
      );
    });
    await page.reload();

    await expect(todayCell(page).getByTestId('todo-count')).toHaveText('9+');
  });
});
