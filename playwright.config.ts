import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PORT}/todo-sdlc/staging/`;

/**
 * SMOKE_BASE_URL: 외부 URL 직접 검증용 (CI에서 배포된 staging URL 사용).
 * 미설정 시 로컬 vite preview (--mode staging) 를 띄워 검증한다.
 */
const externalBase = process.env.SMOKE_BASE_URL?.replace(/\/?$/, '/');

export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: externalBase ?? PREVIEW_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      // CI 는 chromium 만 설치하므로 viewport·UA 만 빌려쓰고 brand/channel 은 강제로 chromium 유지.
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        browserName: 'chromium',
      },
    },
  ],
  webServer: externalBase
    ? undefined
    : {
        command: `npm run build:staging && npx vite preview --mode staging --port ${PORT} --strictPort`,
        url: PREVIEW_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
