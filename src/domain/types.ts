/** ISO 날짜 문자열 (YYYY-MM-DD). 시각 정보는 포함하지 않는다. */
export type DateKey = string;

export interface Todo {
  /** 안정 식별자 (crypto.randomUUID) */
  id: string;
  /** 소속 날짜 (YYYY-MM-DD) */
  date: DateKey;
  /** 1~100자, trim 후 비어있지 않음 */
  title: string;
  /** 완료 여부 */
  done: boolean;
  /** 생성 시각 (ISO 8601) */
  createdAt: string;
  /** 마지막 변경 시각 */
  updatedAt: string;
}

/** localStorage 에 저장되는 루트 스키마 */
export interface PersistRoot {
  /** 스키마 버전. 마이그레이션 분기 키 */
  schemaVersion: 1;
  /** date(YYYY-MM-DD) → Todo[] (조회 O(1), 저장 단순) */
  todosByDate: Record<DateKey, Todo[]>;
}

/** 표준 결과 타입 — TechSpec §5-1 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string } };

export type ErrorCode =
  | 'VALIDATION_EMPTY_TITLE'
  | 'VALIDATION_TITLE_TOO_LONG'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'STORAGE_PARSE_ERROR'
  | 'STORAGE_UNAVAILABLE'
  | 'NOT_FOUND';

export const EMPTY_ROOT: PersistRoot = Object.freeze({
  schemaVersion: 1,
  todosByDate: {},
}) as PersistRoot;
