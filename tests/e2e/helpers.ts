import type { Page } from '@playwright/test';

/**
 * 매 테스트마다 storage 를 깨끗이 두기 위한 헬퍼.
 * Playwright 의 page.goto 는 about:blank 에서 시작하지 않을 수 있어
 * baseURL 진입 후 루트 키를 명시적으로 비운다.
 */
export async function gotoFresh(page: Page) {
  await page.goto('./');
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem('todo-sdlc/v1');
      window.localStorage.removeItem('todo-sdlc/v1.bak');
    } catch {
      /* no-op (시크릿 모드 등) */
    }
  });
  await page.reload();
}

export function todayCell(page: Page) {
  return page.locator('[role="gridcell"][aria-current="date"]').first();
}

export function panel(page: Page) {
  return page.getByTestId('day-detail-panel');
}
