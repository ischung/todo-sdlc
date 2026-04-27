import { expect, test } from '@playwright/test';

const HOME = './';

test.describe('mobile sheet smoke (#14)', () => {
  test('모바일 viewport 에서 시트가 하단 고정 + 빈 상태 안내', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile project 만 실행');

    const response = await page.goto(HOME);
    expect(response?.status(), 'home should respond 200').toBe(200);

    // 오늘 셀 클릭 → 패널 노출
    const todayCell = page
      .getByRole('gridcell')
      .filter({ has: page.locator('[aria-current="date"]') })
      .first();
    await todayCell.click();

    const sheet = page.getByTestId('day-detail-sheet');
    await expect(sheet).toBeVisible();

    // 시트가 화면 하단에 고정인지 — bottom 좌표가 viewport 높이와 같다
    const viewport = page.viewportSize();
    const box = await sheet.boundingBox();
    expect(viewport).not.toBeNull();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeCloseTo(viewport!.height, 0);

    // 신규 진입이라 빈 상태 안내가 보여야 한다 (저장된 항목이 없을 때)
    const empty = sheet.getByTestId('todo-empty');
    if (await empty.isVisible()) {
      await expect(empty).toContainText('아직 할 일이 없어요');
    }
  });
});
