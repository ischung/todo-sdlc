import { createContext } from 'react';
import type { DateKey, Todo } from '../domain/types';
import type { TodosState } from './todosReducer';

export interface TodoContextValue {
  state: TodosState;
  listByDate: (date: DateKey) => Todo[];
  countByDate: (date: DateKey) => number;
}

export const TodoContext = createContext<TodoContextValue | null>(null);
