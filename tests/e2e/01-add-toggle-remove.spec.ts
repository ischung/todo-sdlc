import { expect, test } from '@playwright/test';
import { gotoFresh, panel, todayCell } from './helpers';

test.describe('E2E · 추가 → 완료 → 삭제 happy path (F2/F3/F4)', () => {
  test('한 항목을 추가하고 완료 토글 후 삭제까지 흐름이 끊기지 않는다', async ({ page }) => {
    await gotoFresh(page);

    await todayCell(page).click();
    await panel(page).getByTestId('todo-input').fill('운동');
    await panel(page).getByTestId('todo-input').press('Enter');

    const item = panel(page).getByTestId('todo-item').first();
    await expect(item).toBeVisible();
    await expect(item.getByTestId('todo-title')).toHaveText('운동');

    // 완료 토글 → 취소선
    await item.getByTestId('todo-toggle').click();
    await expect(item).toHaveAttribute('data-done', 'true');

    // 삭제 → 토스트 노출
    await item.getByTestId('todo-remove').click();
    await expect(panel(page).getByTestId('todo-item')).toHaveCount(0);
    await expect(page.getByTestId('undo-toast')).toBeVisible();

    // 되돌리기 → 같은 항목 복원
    await page.getByTestId('undo-button').click();
    await expect(panel(page).getByTestId('todo-item')).toHaveCount(1);
  });
});
