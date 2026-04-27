import { expect, test } from '@playwright/test';
import { gotoFresh, panel, todayCell } from './helpers';

test.describe('E2E · 새로고침 후 데이터 유지 (F6)', () => {
  test('추가한 항목이 새로고침 후에도 그대로 보인다', async ({ page }) => {
    await gotoFresh(page);

    await todayCell(page).click();
    await panel(page).getByTestId('todo-input').fill('레포트 작성');
    await panel(page).getByTestId('todo-input').press('Enter');
    await expect(panel(page).getByTestId('todo-title')).toHaveText('레포트 작성');

    // 패널 닫고 새로고침
    await panel(page).getByTestId('day-detail-close').click();
    await page.reload();

    // 셀 배지 확인
    await expect(todayCell(page).getByTestId('todo-count')).toHaveText('1');

    // 다시 열어 보면 항목이 있다
    await todayCell(page).click();
    await expect(panel(page).getByTestId('todo-title')).toHaveText('레포트 작성');
  });
});
