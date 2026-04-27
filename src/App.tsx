import { CalendarView } from './calendar/CalendarView';
import { TodoProvider } from './state/TodoContext';

declare const __APP_ENV__: string;

export default function App() {
  const appEnv = typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : 'development';

  return (
    <TodoProvider>
      <main className="min-h-screen bg-surface-subtle text-ink p-6 max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-700">
            Hello, Calendar Todo
          </h1>
          <p className="mt-1 text-xs text-ink-faint" data-testid="app-env">
            env: {appEnv}
          </p>
        </header>

        <CalendarView />
      </main>
    </TodoProvider>
  );
}
