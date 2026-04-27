/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const REPO_NAME = 'todo-sdlc';
const BASE_BY_ENV: Record<string, string> = {
  staging: `/${REPO_NAME}/staging/`,
  production: `/${REPO_NAME}/`,
  development: '/',
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', 'VITE_');
  const appEnv = env.VITE_APP_ENV ?? mode;
  const base = BASE_BY_ENV[appEnv] ?? '/';

  return {
    base,
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(appEnv),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'tests/**', 'playwright-report/**'],
    },
  };
});
