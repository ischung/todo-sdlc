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
  /** 일시적 저장 실패 메시지(쿼터 초과 등). 사용자에게 토스트로 노출. */
  errorMessage: string | null;
  dismissError: () => void;
  /** localStorage 자체 비활성(시크릿 모드 등) 여부. true 면 배너 노출. */
  storageUnavailable: boolean;
}

export const TodoContext = createContext<TodoContextValue | null>(null);
