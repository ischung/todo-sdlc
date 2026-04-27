import { createContext } from 'react';
import type { DateKey, Todo } from '../domain/types';
import type { Result } from '../domain/types';
import type { TodosState } from './todosReducer';

export interface AddTodoInput {
  date: DateKey;
  title: string;
}

export interface TodoContextValue {
  state: TodosState;
  listByDate: (date: DateKey) => Todo[];
  countByDate: (date: DateKey) => number;
  addTodo: (input: AddTodoInput) => Result<Todo>;
  toggleTodo: (input: { date: DateKey; id: string }) => Result<void>;
}

export const TodoContext = createContext<TodoContextValue | null>(null);
