import { expect, test } from '@playwright/test';
import { gotoFresh, panel, todayCell } from './helpers';

test.describe('E2E · 유효성 검증 (F2)', () => {
  test('100자 초과 입력은 maxLength 로 차단된다', async ({ page }) => {
    await gotoFresh(page);
    await todayCell(page).click();

    const input = panel(page).getByTestId('todo-input');
    await input.focus();
    // 110자 입력 시도 → input maxLength 가 100자로 강제 자른다
    await page.keyboard.insertText('가'.repeat(110));
    const value = await input.inputValue();
    expect(value.length).toBe(100);
  });

  test('빈 입력은 차단되고 친절한 에러 메시지가 보인다', async ({ page }) => {
    await gotoFresh(page);
    await todayCell(page).click();
    await panel(page).getByTestId('todo-add').click();
    await expect(panel(page).getByTestId('todo-input-error')).toBeVisible();
    await expect(panel(page).getByTestId('todo-list')).toHaveCount(0);
  });
});
