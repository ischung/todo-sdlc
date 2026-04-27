import type { PersistRoot, Result } from '../domain/types';

export const STORAGE_KEY = 'todo-sdlc/v1';
export const BACKUP_KEY = 'todo-sdlc/v1.bak';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * 영속 저장 격리 계층 (TechSpec §2-1).
 *
 * - 단일 키 `todo-sdlc/v1` 에 PersistRoot 트리 전체를 직렬화
 * - JSON 파싱 실패 시 원본을 `todo-sdlc/v1.bak` 으로 백업하고 빈 트리 반환
 * - QuotaExceededError 는 STORAGE_QUOTA_EXCEEDED 결과로 변환
 * - localStorage 자체가 비활성(시크릿 모드 등)이면 STORAGE_UNAVAILABLE
 */
export class TodoRepository {
  constructor(private readonly storage: StorageLike | null) {}

  load(): Result<PersistRoot> {
    if (!this.storage) {
      return { ok: false, error: { code: 'STORAGE_UNAVAILABLE', message: '저장소가 비활성화되었어요.' } };
    }

    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') {
      return { ok: true, data: cloneEmpty() };
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidPersistRoot(parsed)) {
        this.backupCorrupted(raw);
        return { ok: true, data: cloneEmpty() };
      }
      return { ok: true, data: parsed };
    } catch {
      this.backupCorrupted(raw);
      return { ok: true, data: cloneEmpty() };
    }
  }

  save(root: PersistRoot): Result<void> {
    if (!this.storage) {
      return { ok: false, error: { code: 'STORAGE_UNAVAILABLE', message: '저장소가 비활성화되었어요.' } };
    }

    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(root));
      return { ok: true, data: undefined };
    } catch (err) {
      if (isQuotaExceeded(err)) {
        return {
          ok: false,
          error: {
            code: 'STORAGE_QUOTA_EXCEEDED',
            message: '저장 공간이 가득 찼어요. 오래된 항목을 정리해주세요.',
          },
        };
      }
      throw err;
    }
  }

  private backupCorrupted(raw: string): void {
    try {
      this.storage?.setItem(BACKUP_KEY, raw);
      this.storage?.removeItem(STORAGE_KEY);
    } catch {
      // 백업 실패는 치명적이지 않음 — 빈 트리로 계속
    }
  }
}

function cloneEmpty(): PersistRoot {
  return { schemaVersion: 1, todosByDate: {} };
}

function isValidPersistRoot(value: unknown): value is PersistRoot {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<PersistRoot>;
  if (v.schemaVersion !== 1) return false;
  if (typeof v.todosByDate !== 'object' || v.todosByDate === null) return false;
  return true;
}

function isQuotaExceeded(err: unknown): boolean {
  // 브라우저/jsdom 별 시그널: DOMException name 또는 legacy code
  // (DOMException 이 Error 를 상속하지 않는 환경도 있어 instanceof 검사를 피한다)
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { name?: string; code?: number };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014
  );
}

/** 브라우저의 window.localStorage 를 안전하게 가져오는 팩토리. SSR/시크릿 모드 가드. */
export function detectBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probeKey = '__todo-sdlc-probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}
