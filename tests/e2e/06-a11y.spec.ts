import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoFresh, panel, todayCell } from './helpers';

const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('E2E · 접근성 (#19)', () => {
  test('초기 화면에 axe 위반이 없다', async ({ page }) => {
    await gotoFresh(page);
    const result = await new AxeBuilder({ page }).withTags(RULES).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  });

  test('패널 열린 상태에도 axe 위반이 없다', async ({ page }) => {
    await gotoFresh(page);
    await todayCell(page).click();
    await expect(panel(page)).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(RULES).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  });

  test('키보드만으로 추가 → 완료 → 삭제 → undo 가 가능하다', async ({ page }) => {
    await gotoFresh(page);

    // Tab 키로 nav → 그리드 셀로 이동. 직접 focus 후 Enter 로 패널 열기.
    await todayCell(page).focus();
    await page.keyboard.press('Enter');
    await expect(panel(page)).toBeVisible();

    // 입력 필드는 패널의 첫 인터랙티브 → Tab 한 번이면 충분.
    // 안전하게 testid 로 직접 focus.
    const input = panel(page).getByTestId('todo-input');
    await input.focus();
    await page.keyboard.type('운동');
    await page.keyboard.press('Enter');

    const item = panel(page).getByTestId('todo-item').first();
    await expect(item).toBeVisible();

    // 체크박스는 Space 로 토글
    await item.getByTestId('todo-toggle').focus();
    await page.keyboard.press('Space');
    await expect(item).toHaveAttribute('data-done', 'true');

    // 삭제 버튼 → Enter
    await item.getByTestId('todo-remove').focus();
    await page.keyboard.press('Enter');
    await expect(panel(page).getByTestId('todo-item')).toHaveCount(0);

    // 토스트의 되돌리기 → Enter
    await page.getByTestId('undo-button').focus();
    await page.keyboard.press('Enter');
    await expect(panel(page).getByTestId('todo-item')).toHaveCount(1);
  });
});
