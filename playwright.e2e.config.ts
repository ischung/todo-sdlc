import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PORT}/todo-sdlc/staging/`;

/**
 * E2E config — 로컬에서 vite preview --mode staging 위에 PRD 의 사용자 시나리오를 검증.
 *   · smoke (tests/smoke/) 는 빠른 외부 URL 헬스체크용 → 별도 config 유지
 *   · e2e 는 같은 preview 인스턴스에서 시나리오를 직렬 실행해 새로고침/탭 격리를 단순화
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 1 : 0,
  // 새로고침/탭 시나리오 가 storage 를 공유하므로 직렬 실행이 가장 안전.
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-e2e-report' }]],
  use: {
    baseURL: PREVIEW_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    // --host 127.0.0.1 로 명시: vite preview 의 기본 host 가 환경별로 달라
    // CI 의 webServer.url 매칭이 빗나가는 것을 방지.
    command: `npm run build:staging && npx vite preview --mode staging --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
