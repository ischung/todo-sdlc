declare const __APP_ENV__: string;

export default function App() {
  const appEnv = typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : 'development';

  return (
    <main className="min-h-screen bg-surface-subtle text-ink p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-700">
        Hello, Calendar Todo
      </h1>
      <p className="mt-2 text-ink-muted">
        SDLC 실습 — 부트스트랩 단계입니다. 후속 슬라이스에서 월간 달력이 이 자리에 옵니다.
      </p>
      <p className="mt-1 text-xs text-ink-faint" data-testid="app-env">
        env: {appEnv}
      </p>
    </main>
  );
}
