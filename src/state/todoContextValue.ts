import { createContext } from 'react';
import type { DateKey, Todo } from '../domain/types';
import type { Result } from '../domain/types';
import type { TodosState } from './todosReducer';

export interface AddTodoInput {
  date: DateKey;
  title: string;
}

export interface PendingRemoval {
  date: DateKey;
  todo: Todo;
  index: number;
}

export interface TodoContextValue {
  state: TodosState;
  listByDate: (date: DateKey) => Todo[];
  countByDate: (date: DateKey) => number;
  addTodo: (input: AddTodoInput) => Result<Todo>;
  toggleTodo: (input: { date: DateKey; id: string }) => Result<void>;
  removeTodo: (input: { date: DateKey; id: string }) => Result<PendingRemoval>;
  /** 5초 타이머가 만료되기 전이면 마지막 삭제를 같은 인덱스로 복원. */
  undoRemove: () => Result<void>;
  /** 현재 진행 중인 5초 undo 대상. 없으면 null. */
  pendingRemoval: PendingRemoval | null;
}

export const TodoContext = createContext<TodoContextValue | null>(null);
