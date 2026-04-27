import type { DateKey } from '../domain/types';
import { useTodos } from '../state/useTodos';

interface TodoListProps {
  date: DateKey;
}

export function TodoList({ date }: TodoListProps) {
  const { listByDate } = useTodos();
  const items = listByDate(date);

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-faint" data-testid="todo-empty">
        아직 등록된 할 일이 없어요.
      </p>
    );
  }

  return (
    <ul aria-label={`${date} 할 일 목록`} className="flex flex-col gap-1" data-testid="todo-list">
      {items.map((todo) => (
        <li
          key={todo.id}
          data-testid="todo-item"
          className="rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-sm"
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
