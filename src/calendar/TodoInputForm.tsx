import { useRef, useState, type FormEvent } from 'react';
import type { DateKey } from '../domain/types';
import { useTodos } from '../state/useTodos';

const TITLE_MAX = 100;

interface TodoInputFormProps {
  date: DateKey;
}

export function TodoInputForm({ date }: TodoInputFormProps) {
  const { addTodo } = useTodos();
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = addTodo({ date, title: value });
    if (!result.ok) {
      setError(result.error.message);
      setShake(true);
      window.setTimeout(() => setShake(false), 320);
      return;
    }
    setValue('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} aria-label="할 일 추가" className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="새 할 일 (Enter)"
          aria-label="할 일 내용"
          aria-invalid={error ? 'true' : undefined}
          data-testid="todo-input"
          className={`flex-1 rounded-md border border-surface-muted bg-surface px-3 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            shake ? 'animate-shake' : ''
          }`}
        />
        <button
          type="submit"
          data-testid="todo-add"
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          추가
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600" data-testid="todo-input-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
