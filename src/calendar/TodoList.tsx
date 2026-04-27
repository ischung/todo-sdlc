import type { DateKey, Todo } from '../domain/types';
import { useTodos } from '../state/useTodos';

interface TodoListProps {
  date: DateKey;
}

export function TodoList({ date }: TodoListProps) {
  const { listByDate, toggleTodo, removeTodo } = useTodos();
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
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => toggleTodo({ date, id: todo.id })}
          onRemove={() => removeTodo({ date, id: todo.id })}
        />
      ))}
    </ul>
  );
}

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
}

function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  return (
    <li
      data-testid="todo-item"
      data-done={todo.done || undefined}
      className="rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-sm flex items-center gap-2"
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={onToggle}
        aria-label={`${todo.title} 완료 여부`}
        data-testid="todo-toggle"
        className="h-4 w-4 accent-brand-600"
      />
      <span
        data-testid="todo-title"
        className={
          todo.done ? 'flex-1 text-ink-faint line-through' : 'flex-1 text-ink'
        }
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${todo.title} 삭제`}
        data-testid="todo-remove"
        className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-muted hover:text-red-600"
      >
        ✕
      </button>
    </li>
  );
}
