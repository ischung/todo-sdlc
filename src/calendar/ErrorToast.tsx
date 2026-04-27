import { useTodos } from '../state/useTodos';

export function ErrorToast() {
  const { errorMessage, dismissError } = useTodos();
  if (!errorMessage) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="error-toast"
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-card flex items-center gap-3"
    >
      <span>{errorMessage}</span>
      <button
        type="button"
        onClick={dismissError}
        aria-label="에러 닫기"
        data-testid="error-toast-close"
        className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/20"
      >
        닫기
      </button>
    </div>
  );
}

export function StorageUnavailableBanner() {
  const { storageUnavailable } = useTodos();
  if (!storageUnavailable) return null;
  return (
    <div
      role="status"
      data-testid="storage-unavailable-banner"
      className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      저장소가 비활성화되어 있어요. 시크릿 모드라면 일반 창에서 다시 열어주세요.
    </div>
  );
}
