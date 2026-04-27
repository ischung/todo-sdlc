# Issues — 개인용 달력 Todo 앱 (Vertical Slice + CI/CD-first)

> **원본 TechSpec**     : `techspec.md`
> **원본 PRD**          : `prd.md`
> **생성일**            : 2026-04-27
> **분할 전략**         : Vertical Slice + CI/CD-first (Walking Skeleton → MVP)
> **생성 스킬**         : `generate-issues-vertical` v3.0
> **출력 파일**         : `issues-vertical.md`
> **형제 파일(참고)**   : `issues-layered.md` — 계층별 분할 결과 전용
> **총 이슈 수**         : 20개
> **Phase 구성**         : 0-A 3 · 0-B 3 · 0-C 3 · 1 4 · 2 2 · 3 5
> **총 예상 소요**       : 약 16일
> **의존성 간선 수**     : 26, 사이클 없음
> **가장 빠른 CI/CD 도달**: CI-1 → CI-2 → CI-4 → CI-5 → CI-6 (스테이징 smoke 통과) = 누적 약 3.5일

---

## 📜 권장 실행 순서 (위상 정렬)

| order | 임시ID | 레이블                                  | 제목                                                           |
| :---- | :----- | :-------------------------------------- | :------------------------------------------------------------- |
| 001   | CI-1   | [CI] priority:p0                        | Vite+React+TS+Tailwind 프로젝트 부트스트랩 + lint/format        |
| 002   | CI-2   | [CI] priority:p0                        | GitHub Actions 기본 워크플로 (lint + typecheck + unit test)     |
| 003   | CI-3   | [CI] priority:p0 mandatory-gate         | PR 보호 규칙 + 상태 배지 + CODEOWNERS                           |
| 004   | CI-4   | [CD] priority:p0 profile:staging        | GitHub Pages 스테이징 환경 준비 + 빌드 산출물 호스팅            |
| 005   | CI-5   | [CD] priority:p0 profile:staging        | main 머지 → 스테이징 자동 배포 워크플로                          |
| 006   | CI-6   | [CD] priority:p0 profile:staging mandatory-gate | 배포 후 Playwright smoke test 자동 수행                  |
| 007   | CI-7   | [Skeleton] priority:p0                  | 빈 월간 달력 그리드 + 오늘 날짜 강조 (date-fns)                 |
| 008   | CI-8   | [Skeleton] priority:p0                  | TodoRepository (localStorage) + load/save 인터페이스             |
| 009   | CI-9   | [Skeleton] priority:p1                  | TodoContext + useReducer 뼈대 (LOAD 액션)                       |
| 010   | CI-10  | [Slice] priority:p1                     | Slice 1 — 월간 달력 + 이전/다음 달 이동 (F1, F8)                |
| 011   | CI-11  | [Slice] priority:p1                     | Slice 2 — 날짜 클릭 → 할 일 추가 + 영속 저장 (F2, F6)            |
| 012   | CI-12  | [Slice] priority:p1                     | Slice 3 — 완료 토글 + 미완료 개수 배지 (F3, F5)                 |
| 013   | CI-13  | [Slice] priority:p1                     | Slice 4 — 삭제 + 5초 undo 토스트 (F4)                            |
| 014   | CI-14  | [Slice] priority:p2                     | 모바일 반응형 (하단 시트) + 빈 상태 안내                        |
| 015   | CI-15  | [Slice] priority:p2                     | 다른 탭 동기화 (storage 이벤트) + 에러 토스트                   |
| 016   | CI-16  | [Security] priority:p0 mandatory-gate   | CodeQL SAST + npm audit 의존성 스캔 워크플로                    |
| 017   | CI-17  | [CD] priority:p0 profile:prod mandatory-gate | 프로덕션 배포 파이프라인 + 수동 승인 게이트                |
| 018   | CI-18  | [QA] priority:p2                        | E2E 테스트 스위트 확장 (F1~F8 + 새로고침 후 데이터 유지)        |
| 019   | CI-19  | [A11y] priority:p2                      | 접근성 패스 (키보드 / ARIA / 색상 대비 WCAG AA)                 |
| 020   | CI-20  | [Docs] priority:p2                      | README + 사용 가이드 + 운영 런북                                |

---

## 🔗 의존성 그래프

```
CI-1  ──►  CI-2  ──►  CI-3
              │
              ├──►  CI-4  ──►  CI-5  ──►  CI-6
              │                              │
              │                              ├──►  CI-7  ──►  CI-8  ──►  CI-9
              │                              │                              │
              │                              │                              ▼
              │                              │                          CI-10  ──►  CI-11  ──►  CI-12  ──►  CI-13
              │                              │                                                                │
              │                              │                                                                ├──►  CI-14
              │                              │                                                                ├──►  CI-15
              │                              │                                                                ├──►  CI-18
              │                              │                                                                ├──►  CI-19
              │                              │                                                                └──►  CI-17  ──►  CI-20
              └──►  CI-16 (Security, CI-2 이후 병렬 가능)
```

**Kahn's 알고리즘 검증**: 사이클 없음 ✅ / 모든 노드 도달 가능 ✅

---

## Phase 0-A · CI 부트스트랩

### #CI-1 [CI] Vite+React+TS+Tailwind 프로젝트 부트스트랩 + lint/format

**레이블**       : [CI]
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:001, phase-0a-ci
**Phase**        : 0-A CI 부트스트랩
**연관 US**      : 없음 (인프라)
**예상 소요**     : 0.5일
**Depends on**   : 없음
**Required by**  : #CI-2, #CI-4
**분할 전략**     : Vertical Slice + CI/CD-first
**출력 파일**     : `issues-vertical.md`

#### 배경
모든 후속 이슈가 동일한 빌드/린트/포맷 환경에서 동작해야 한다. Vite + React 18 + TypeScript + TailwindCSS + ESLint + Prettier 를 한 번에 셋업해 "초록불 시작점" 을 확보한다.

#### 구현 범위 (수직 슬라이스 체크리스트)
- [ ] **UI**: 기본 `App.tsx` 가 "Hello, Calendar Todo" 를 렌더 (Tailwind 적용 확인용)
- [ ] **API**: 해당 없음
- [ ] **DB**: 해당 없음
- [ ] **CI/CD**: 해당 없음 (다음 이슈에서 구축)
- [ ] **유효성·권한**: 해당 없음
- [ ] **테스트**: Vitest + RTL 설정, 샘플 단위 테스트 1개 (`<App />` 렌더 smoke)
- [ ] **배포**: 로컬 `npm run build` 성공

#### 수락 기준 (Acceptance Criteria)
- [ ] `npm install && npm run dev` 로 로컬 개발 서버가 뜬다
- [ ] `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` 모두 통과
- [ ] Tailwind 클래스가 빌드 산출물에 포함된다 (예: `text-2xl` 적용 확인)
- [ ] `.editorconfig` / `.prettierrc` / `.eslintrc.cjs` / `tsconfig.json` 이 커밋되어 있다

#### 참고
- TechSpec §3 (기술 스택), §7-1 (Tailwind 토큰 초안)

---

### #CI-2 [CI] GitHub Actions 기본 워크플로 (lint + typecheck + unit test)

**레이블**       : [CI]
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:002, phase-0a-ci
**Phase**        : 0-A CI 부트스트랩
**연관 US**      : 없음 (인프라)
**예상 소요**     : 0.5일
**Depends on**   : #CI-1
**Required by**  : #CI-3, #CI-4, #CI-16
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
모든 PR 이 머지되기 전에 자동 검증을 거치도록 한다. lint → typecheck → unit test 의 3단계 게이트를 GitHub Actions 로 구축한다.

#### 구현 범위
- [ ] **UI**: 해당 없음
- [ ] **API**: 해당 없음
- [ ] **DB**: 해당 없음
- [ ] **CI/CD**: `.github/workflows/ci.yml` 신규
- [ ] **유효성·권한**: 해당 없음
- [ ] **테스트**: PR 이벤트에서 워크플로가 트리거되는지 확인
- [ ] **배포**: 해당 없음

#### 수락 기준
- [ ] PR 생성 시 `ci` 잡이 자동 실행된다
- [ ] `lint`, `typecheck`, `test` 가 각각 별도 step 으로 실행되고 실패 시 PR 머지 불가능 표시가 보인다
- [ ] Node 20.x 사용, npm 캐시 활성화로 평균 실행 시간 2분 이하

#### 참고
- TechSpec §2-3 (CI/CD)

---

### #CI-3 [CI] PR 보호 규칙 + 상태 배지 + CODEOWNERS

**레이블**       : [CI] mandatory-gate
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:003, phase-0a-ci
**Phase**        : 0-A CI 부트스트랩
**연관 US**      : 없음 (인프라)
**예상 소요**     : 0.5일
**Depends on**   : #CI-2
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
실수로 main 에 직접 푸시하거나 CI 실패 PR 이 머지되는 사고를 막는다.

#### 구현 범위
- [ ] **CI/CD**: GitHub branch protection rules — `main` 직접 푸시 금지, 1 review 필수, `ci` status check 필수
- [ ] **테스트**: 보호 규칙 위반 시 머지 버튼 비활성 확인
- [ ] README 상단에 CI 상태 배지 추가
- [ ] `CODEOWNERS` 파일 추가 (현재는 owner 1명)

#### 수락 기준
- [ ] main 에 직접 push 시 거부된다
- [ ] CI 실패 PR 은 머지 버튼이 비활성화된다
- [ ] README 의 CI 배지가 main 의 최신 상태를 반영한다

---

## Phase 0-B · CD 스테이징

### #CI-4 [CD] GitHub Pages 스테이징 환경 준비 + 빌드 산출물 호스팅

**레이블**       : [CD] profile:staging
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:004, phase-0b-cd
**Phase**        : 0-B CD 스테이징
**연관 US**      : 없음 (인프라)
**예상 소요**     : 0.5일
**Depends on**   : #CI-2
**Required by**  : #CI-5
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
SPA 정적 빌드를 호스팅할 스테이징 환경(GitHub Pages 의 별도 base path 또는 별도 워크플로)을 마련한다. Vite 의 `base` 옵션을 환경별로 분기.

#### 구현 범위
- [ ] **CI/CD**: `vite.config.ts` 의 `base` 를 환경변수로 분기 (`/todo-sdlc/staging/`)
- [ ] GitHub Pages 활성화 + Pages 빌드 권한 설정
- [ ] 환경변수 `VITE_APP_ENV=staging` 주입
- [ ] **테스트**: 로컬에서 `npm run build -- --mode staging` 성공

#### 수락 기준
- [ ] `npm run build -- --mode staging` 산출물이 `dist/` 에 생성된다
- [ ] GitHub Pages 설정에서 source 가 `gh-pages` 브랜치로 지정되어 있다
- [ ] 임시 빈 빌드를 수동 업로드 시 `https://<user>.github.io/todo-sdlc/staging/` 가 200 응답

---

### #CI-5 [CD] main 머지 → 스테이징 자동 배포 워크플로

**레이블**       : [CD] profile:staging
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:005, phase-0b-cd
**Phase**        : 0-B CD 스테이징
**연관 US**      : 없음 (인프라)
**예상 소요**     : 1일
**Depends on**   : #CI-4
**Required by**  : #CI-6
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
"main 머지 = 스테이징 배포" 자동화로 모든 슬라이스가 즉시 스테이징 URL 에서 검증되도록 한다.

#### 구현 범위
- [ ] **CI/CD**: `.github/workflows/deploy-staging.yml` 신규 — main push 트리거
- [ ] `actions/deploy-pages@v4` 또는 `peaceiris/actions-gh-pages` 사용
- [ ] 빌드 → artifact 업로드 → Pages 배포 3단계
- [ ] **테스트**: dummy commit 으로 자동 배포 1회 검증

#### 수락 기준
- [ ] main 에 머지하면 5분 이내 스테이징 URL 이 갱신된다
- [ ] 워크플로 실패 시 main 의 스테이징은 직전 버전을 유지한다
- [ ] Actions 로그에 배포 URL 이 출력된다

---

### #CI-6 [CD] 배포 후 Playwright smoke test 자동 수행

**레이블**       : [CD] profile:staging mandatory-gate
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:006, phase-0b-cd
**Phase**        : 0-B CD 스테이징
**연관 US**      : 없음 (인프라)
**예상 소요**     : 0.5일
**Depends on**   : #CI-5
**Required by**  : #CI-7, #CI-10, #CI-17
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
배포 자체는 성공해도 런타임에서 깨질 수 있다. 스테이징 URL 에 Playwright 로 접속해 핵심 페이지가 200 + 화면이 렌더되는지 확인한다.

#### 구현 범위
- [ ] **CI/CD**: deploy-staging 워크플로 끝에 `smoke` 잡 추가
- [ ] Playwright 설치 + `tests/smoke.spec.ts` (홈 페이지 진입, 핵심 셀렉터 1개 visible)
- [ ] 실패 시 deploy 워크플로 실패 처리 (=mandatory-gate)
- [ ] **테스트**: 일부러 깨진 빌드를 푸시해 smoke 가 실패하는지 확인

#### 수락 기준
- [ ] 스테이징 배포 직후 Playwright smoke 가 자동 실행된다
- [ ] smoke 실패 시 워크플로가 빨간불이 된다
- [ ] HTML 리포트가 artifact 로 업로드된다

---

## Phase 0-C · Walking Skeleton

### #CI-7 [Skeleton] 빈 월간 달력 그리드 + 오늘 날짜 강조 (date-fns)

**레이블**       : [Skeleton]
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:007, phase-0c-skeleton
**Phase**        : 0-C Walking Skeleton
**연관 US**      : F1, F8 일부
**예상 소요**     : 1일
**Depends on**   : #CI-6
**Required by**  : #CI-8, #CI-10
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
사용자가 처음 접속했을 때 "이번 달이 보이고 오늘이 강조된" 한 화면을 본다. 데이터·상호작용 없는 가장 얇은 UI E2E.

#### 구현 범위
- [ ] **UI**: `<Header>` (월 표시) + `<CalendarView>` 7×N 그리드 + `<DateCell>` (오늘 강조)
- [ ] date-fns: `startOfMonth`, `eachDayOfInterval`, `format` 사용
- [ ] Tailwind 토큰 적용 (`brand-700`, `surface`)
- [ ] **테스트**: RTL — 오늘이 포함된 셀에 `aria-current="date"` 가 붙는지

#### 수락 기준
- [ ] 진입 시 현재 월의 7×N 그리드가 렌더된다
- [ ] 오늘 날짜 셀의 숫자가 `brand-700` + `font-bold` 로 표시된다
- [ ] 스테이징 URL 에서도 동일하게 동작한다 (smoke 가 통과)
- [ ] CI 초록불

---

### #CI-8 [Skeleton] TodoRepository (localStorage) + load/save 인터페이스

**레이블**       : [Skeleton]
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:008, phase-0c-skeleton
**Phase**        : 0-C Walking Skeleton
**연관 US**      : F6 기반
**예상 소요**     : 0.5일
**Depends on**   : #CI-7
**Required by**  : #CI-9, #CI-11
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
영속 저장 의존을 한 곳에 격리해 추후 IndexedDB·서버 동기화로 교체 가능하도록 인터페이스를 먼저 만든다.

#### 구현 범위
- [ ] **저장**: `src/infra/TodoRepository.ts` — `load(): Result<PersistRoot>`, `save(root): Result<void>`
- [ ] 단일 키 `todo-sdlc/v1` 사용
- [ ] JSON 파싱 실패 시 `todo-sdlc/v1.bak` 백업 + 빈 트리 반환
- [ ] QuotaExceeded 처리 → `STORAGE_QUOTA_EXCEEDED` 에러 반환
- [ ] **테스트**: Vitest — happy path, 파싱 실패, quota 시나리오

#### 수락 기준
- [ ] `load()` 가 빈 저장소에서 `{schemaVersion:1, todosByDate:{}}` 를 반환한다
- [ ] 손상된 JSON 이 들어 있으면 백업 후 빈 트리를 반환한다
- [ ] `save()` 후 `load()` 가 동일 트리를 복원한다
- [ ] 단위 테스트 5개 이상, 모두 통과

#### 참고
- TechSpec §4 (데이터 모델), §5-2 (Repository 인터페이스)

---

### #CI-9 [Skeleton] TodoContext + useReducer 뼈대 (LOAD 액션)

**레이블**       : [Skeleton]
**공통 레이블**   : strategy:vertical-slice, priority:p1, order:009, phase-0c-skeleton
**Phase**        : 0-C Walking Skeleton
**연관 US**      : 없음 (상태 관리 인프라)
**예상 소요**     : 1일
**Depends on**   : #CI-8
**Required by**  : #CI-10
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
이후 모든 슬라이스가 동일한 상태 관리 흐름(Provider → Hook → Reducer → Repository)을 따르도록 뼈대를 먼저 만든다.

#### 구현 범위
- [ ] **상태**: `TodoContext`, `TodoProvider`, `useTodos`, `todosReducer` 골격
- [ ] LOAD 액션만 구현 — 진입 시 Repository 에서 트리 로드 → 디스패치
- [ ] `listByDate`, `countByDate` 셀렉터 노출 (이후 슬라이스에서 소비)
- [ ] **테스트**: RTL + Provider 래핑 — 초기 LOAD 동작

#### 수락 기준
- [ ] `App` 이 `TodoProvider` 로 감싸져 있다
- [ ] 진입 시 1회 LOAD 가 디스패치된다
- [ ] `listByDate('2026-04-27')` 가 빈 배열 또는 저장된 배열을 정확히 반환한다
- [ ] 단위 테스트 통과

---

## Phase 1 · Core MVP (P0 수직 슬라이스)

### #CI-10 [Slice] Slice 1 — 월간 달력 + 이전/다음 달 이동 (F1, F8)

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p1, order:010, phase-1-mvp
**Phase**        : 1 Core MVP
**연관 US**      : F1, F8
**예상 소요**     : 1.5일
**Depends on**   : #CI-9, #CI-6
**Required by**  : #CI-11
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
"이번 달이 한눈에 보이고 임의 월로 이동 가능" 한 첫 번째 사용자 가치를 전달한다.

#### 구현 범위
- [ ] **UI**: 헤더에 "이전 달 / 오늘로 이동 / 다음 달" 버튼
- [ ] 월 변경 시 7×N 그리드 즉시 갱신
- [ ] 오늘 강조는 현재 월일 때만 활성
- [ ] **테스트**: RTL — 다음 달 클릭 → 헤더 텍스트 변경, 셀 개수 갱신
- [ ] **배포**: 스테이징 URL 에서 동작

#### 수락 기준
- [ ] 이전/다음 달 버튼으로 임의 월(과거·미래) 이동 가능
- [ ] "오늘로 이동" 클릭 시 현재 월로 즉시 복귀하고 오늘이 강조된다
- [ ] CI 초록불 + 스테이징 smoke 통과

---

### #CI-11 [Slice] Slice 2 — 날짜 클릭 → 할 일 추가 + 영속 저장 (F2, F6)

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p1, order:011, phase-1-mvp
**Phase**        : 1 Core MVP
**연관 US**      : F2, F6
**예상 소요**     : 1.5일
**Depends on**   : #CI-10, #CI-8
**Required by**  : #CI-12
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
사용자가 핵심 가치(할 일 기록)를 처음으로 경험하는 슬라이스. 새로고침에도 데이터가 살아있어야 한다.

#### 구현 범위
- [ ] **UI**: `<DayDetailPanel>` (모달/사이드 패널) + `<TodoInputForm>` + `<TodoList>` (최소 표시)
- [ ] **상태**: ADD 액션 + reducer 처리 + Repository.save 호출
- [ ] **유효성**: trim 후 1~100자, maxLength=100, 빈 입력 시 흔들림
- [ ] **테스트**:
  - 단위: reducer ADD 동작
  - 통합: 입력 후 Enter → 목록 갱신 + 입력창 비워짐
  - E2E: 추가 후 새로고침 → 데이터 유지
- [ ] **배포**: 스테이징에서 추가 → 새로고침 → 유지 확인

#### 수락 기준
- [ ] 날짜 클릭 시 패널이 열린다
- [ ] Enter 로 추가, 입력창 비워지고 포커스 유지
- [ ] 100자 초과 입력은 차단된다
- [ ] 새로고침 후에도 추가한 항목이 그대로 보인다
- [ ] CI 초록불 + 스테이징 smoke 통과

---

### #CI-12 [Slice] Slice 3 — 완료 토글 + 미완료 개수 배지 (F3, F5)

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p1, order:012, phase-1-mvp
**Phase**        : 1 Core MVP
**연관 US**      : F3, F5
**예상 소요**     : 1일
**Depends on**   : #CI-11
**Required by**  : #CI-13
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
"끝낸 일을 체크" + "달력 칸의 개수 배지" — Core Goal "마감을 놓치지 않게" 의 시각 신호.

#### 구현 범위
- [ ] **UI**: `<TodoItem>` 좌측 체크박스, 완료 시 취소선 + 회색 톤
- [ ] **UI**: `<DateCell>` 우상단에 미완료 개수 `<Badge>` (0이면 숨김, 9 초과 시 "9+")
- [ ] **상태**: TOGGLE 액션, `countByDate` 셀렉터가 미완료만 카운트
- [ ] **테스트**: 단위 reducer, RTL 통합, E2E (체크 → 배지 -1)

#### 수락 기준
- [ ] 체크박스 클릭으로 완료/미완료 토글된다
- [ ] 완료 항목은 취소선 처리된다
- [ ] 배지 숫자가 추가/완료/삭제 시 즉시 갱신된다
- [ ] CI 초록불 + 스테이징 smoke 통과

---

### #CI-13 [Slice] Slice 4 — 삭제 + 5초 undo 토스트 (F4)

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p1, order:013, phase-1-mvp
**Phase**        : 1 Core MVP
**연관 US**      : F4
**예상 소요**     : 1일
**Depends on**   : #CI-12
**Required by**  : #CI-14, #CI-15, #CI-17, #CI-18, #CI-19
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
실수로 삭제한 항목을 복구할 수 있어야 사용자가 안심하고 정리한다.

#### 구현 범위
- [ ] **UI**: `<TodoItem>` 우측 삭제 아이콘
- [ ] **UI**: `<UndoToast>` 5초 노출, "되돌리기" 클릭 시 RESTORE 액션
- [ ] **상태**: REMOVE / RESTORE 액션 + 원래 인덱스 보존
- [ ] **테스트**: 단위 reducer, RTL 통합, E2E (삭제 → undo → 복원)

#### 수락 기준
- [ ] 삭제 즉시 목록에서 사라지고 토스트가 노출된다
- [ ] 5초 내 "되돌리기" 클릭 시 같은 위치로 복원된다
- [ ] 5초 경과 시 영속 삭제로 확정된다
- [ ] CI 초록불 + 스테이징 smoke 통과

---

## Phase 2 · MVP 확장

### #CI-14 [Slice] 모바일 반응형 (하단 시트) + 빈 상태 안내

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p2, order:014, phase-2-extend
**Phase**        : 2 MVP 확장
**연관 US**      : F2 (UX 개선)
**예상 소요**     : 1일
**Depends on**   : #CI-13
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
대학생/취준생은 모바일에서도 자주 쓴다. 좁은 화면에서 패널이 가독성을 깨면 안 된다.

#### 구현 범위
- [ ] **UI**: <640px 에서 `<DayDetailPanel>` 을 하단 시트(`fixed bottom-0`)로 전환
- [ ] **UI**: 빈 상태 — "아직 할 일이 없어요. 첫 번째 항목을 추가해보세요!"
- [ ] **테스트**: Playwright viewport 모바일 (`iPhone 13`) 시나리오 1개

#### 수락 기준
- [ ] 모바일 viewport 에서 시트가 하단 고정된다
- [ ] 항목 0개일 때 빈 상태 안내가 보인다
- [ ] CI 초록불 + 스테이징 smoke 통과

---

### #CI-15 [Slice] 다른 탭 동기화 (storage 이벤트) + 에러 토스트

**레이블**       : [Slice]
**공통 레이블**   : strategy:vertical-slice, priority:p2, order:015, phase-2-extend
**Phase**        : 2 MVP 확장
**연관 US**      : F6 (엣지 케이스)
**예상 소요**     : 1일
**Depends on**   : #CI-13
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
같은 사용자가 두 개의 탭을 열어두고 한쪽에서 추가하면 다른 쪽도 자동 갱신되어야 한다. 또한 저장 실패 시 사용자에게 친근한 에러 토스트를 보여준다.

#### 구현 범위
- [ ] **상태**: `window.addEventListener('storage', …)` 으로 LOAD 재실행
- [ ] **UI**: 저장 실패 시 친근한 톤의 토스트 ("앗, 저장하지 못했어요. 다시 시도해주세요.")
- [ ] **테스트**: 단위 — storage 이벤트 모킹 후 LOAD 디스패치 검증

#### 수락 기준
- [ ] 한쪽 탭에서 추가 → 다른 탭에서 5초 이내 갱신
- [ ] localStorage 비활성(시크릿 모드 시뮬레이션) 시 배너가 보인다
- [ ] CI 초록불

---

## Phase 3 · 운영화 (Security · CD prod · QA · A11y · Docs)

### #CI-16 [Security] CodeQL SAST + npm audit 의존성 스캔 워크플로

**레이블**       : [Security] mandatory-gate
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:016, phase-3-ops
**Phase**        : 3 운영화
**연관 US**      : 없음 (보안)
**예상 소요**     : 0.5일
**Depends on**   : #CI-2
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
정적 분석과 의존성 취약점 자동 스캔으로 라이브러리 발 사고를 사전에 차단한다. CI-2 이후 병렬 실행 가능.

#### 구현 범위
- [ ] **CI/CD**: `.github/workflows/security.yml` — CodeQL JS/TS 분석 + npm audit
- [ ] PR + main 푸시 + 매주 일요일 cron 실행
- [ ] 고/심각 취약점 발견 시 워크플로 실패

#### 수락 기준
- [ ] CodeQL 결과가 GitHub Security 탭에 노출된다
- [ ] npm audit 의 high/critical 발견 시 워크플로 빨간불
- [ ] cron 트리거가 매주 자동 실행된다

---

### #CI-17 [CD] 프로덕션 배포 파이프라인 + 수동 승인 게이트

**레이블**       : [CD] profile:prod mandatory-gate
**공통 레이블**   : strategy:vertical-slice, priority:p0, order:017, phase-3-ops
**Phase**        : 3 운영화
**연관 US**      : 없음 (배포)
**예상 소요**     : 1일
**Depends on**   : #CI-13, #CI-6
**Required by**  : #CI-20
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
스테이징과 프로덕션을 분리해 사용자가 보는 URL 의 안정성을 보호한다. 태그 기반 + 수동 승인 게이트로 출시 시점을 통제.

#### 구현 범위
- [ ] **CI/CD**: `.github/workflows/deploy-prod.yml` — `release/*` 태그 푸시 트리거
- [ ] GitHub Environments `production` + required reviewer 설정
- [ ] 빌드 모드 `production`, `base=/todo-sdlc/`
- [ ] smoke test (Playwright) 실행 후 실패 시 자동 롤백 (직전 태그로 재배포)

#### 수락 기준
- [ ] `release/v0.1.0` 태그 푸시 시 승인 대기 상태가 된다
- [ ] 승인 후 5분 이내 프로덕션 URL 갱신
- [ ] smoke 실패 시 자동 롤백 + Actions 알림

---

### #CI-18 [QA] E2E 테스트 스위트 확장 (F1~F8 + 새로고침 후 데이터 유지)

**레이블**       : [QA]
**공통 레이블**   : strategy:vertical-slice, priority:p2, order:018, phase-3-ops
**Phase**        : 3 운영화
**연관 US**      : F1~F8 통합
**예상 소요**     : 1일
**Depends on**   : #CI-13
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
PRD 의 7개 기능 모두를 사용자 시나리오로 검증한다.

#### 구현 범위
- [ ] **테스트**: Playwright `tests/e2e/` 하위에 시나리오별 spec 추가
  - 추가/완료/삭제 happy path
  - 새로고침 후 데이터 유지
  - 다음 달 이동 + 미래 날짜에 항목 추가
  - 100자 초과 입력 차단
  - 9+ 배지 표시
- [ ] CI 워크플로에 `e2e` 잡 추가 (PR + main)

#### 수락 기준
- [ ] 5개 이상 시나리오 통과
- [ ] HTML 리포트 artifact 업로드
- [ ] 평균 실행 5분 이하

---

### #CI-19 [A11y] 접근성 패스 (키보드 / ARIA / 색상 대비 WCAG AA)

**레이블**       : [A11y]
**공통 레이블**   : strategy:vertical-slice, priority:p2, order:019, phase-3-ops
**Phase**        : 3 운영화
**연관 US**      : 전체 (a11y)
**예상 소요**     : 1일
**Depends on**   : #CI-13
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
키보드 사용자·시각 약자도 동일한 가치를 누리도록 한다. PRD §6 단순성 원칙을 해치지 않는 선에서 보강.

#### 구현 범위
- [ ] **UI**: 모든 인터랙션이 Tab/Enter/Space 로 동작
- [ ] **UI**: 날짜 셀 `role="gridcell"` + `aria-label="2026년 4월 27일, 할 일 3개"`
- [ ] **UI**: 포커스 링 가시화 (`focus:ring-2 focus:ring-brand-500`)
- [ ] **테스트**: `axe-core/playwright` 위반 0건
- [ ] 색상 대비 자동 점검 → WCAG AA (4.5:1) 이상

#### 수락 기준
- [ ] axe 위반 0건
- [ ] 키보드만으로 추가/체크/삭제/undo 가 가능하다
- [ ] CI 초록불

---

### #CI-20 [Docs] README + 사용 가이드 + 운영 런북

**레이블**       : [Docs]
**공통 레이블**   : strategy:vertical-slice, priority:p2, order:020, phase-3-ops
**Phase**        : 3 운영화
**연관 US**      : 없음 (문서)
**예상 소요**     : 0.5일
**Depends on**   : #CI-17
**Required by**  : 없음
**분할 전략**     : Vertical Slice + CI/CD-first

#### 배경
첫 사용자/기여자가 5분 안에 로컬 실행 + 배포 흐름을 이해해야 한다.

#### 구현 범위
- [ ] **Docs**: `README.md` — 프로젝트 개요, 스택, 로컬 실행, 스크립트 표, 배지 (CI/Coverage/Pages)
- [ ] **Docs**: `docs/USER_GUIDE.md` — 스크린샷 포함 사용 흐름
- [ ] **Docs**: `docs/RUNBOOK.md` — 배포 절차, 롤백, 자주 나는 이슈 5가지
- [ ] Mermaid 아키텍처 다이어그램(TechSpec §2-2 재사용)

#### 수락 기준
- [ ] README 가 GitHub 에서 깨짐 없이 렌더된다
- [ ] 사용자 가이드에 추가/완료/삭제/undo 시나리오가 모두 등장한다
- [ ] 운영 런북에 롤백 절차가 명시되어 있다

---

## 부록

### A. 의존성 규칙 검증 (v3.0)

| 규칙 | 검증 |
| :---- | :---- |
| ① CI-1 만 의존성 "없음" 허용 | ✅ |
| ② [CD] 이슈는 [CI] 에 의존 | CI-4 → CI-2 ✅ |
| ③ [Skeleton] 이슈는 Phase 0-B CD 에 의존 | CI-7 → CI-6 ✅ |
| ④ [Slice] 이슈는 [Skeleton] + Phase 0-B CD 에 의존 | CI-10 → CI-9, CI-6 ✅ |
| ⑤ [CD] profile:prod 이슈는 Core MVP + Phase 0-B 에 의존 | CI-17 → CI-13, CI-6 ✅ |
| ⑥ Kahn's 사이클 감지 | 사이클 없음 ✅ |

### B. 누적 일정 (낙관 추정)

| 마일스톤 | 누적 일수 | 효과 |
| :---- | :---- | :---- |
| CI-3 (PR 보호) | 1.5일 | 사고 방지 게이트 가동 |
| CI-6 (스테이징 smoke) | 3.5일 | 모든 후속 이슈가 초록불 + 스테이징 위에서 검증 |
| CI-13 (Slice 4 완료) | 11.5일 | **MVP 데모 가능** (PRD F1~F8 모두 동작) |
| CI-17 (프로덕션 배포) | 13.5일 | 외부 공개 가능 |
| CI-20 (Docs) | 16일 | v0.1 출시 종료 |

### C. 후속 스킬 체인 (안내)

```
✅ issues-vertical.md 저장 완료!

⏭️ 다음 단계
  1️⃣  /register-issues-to-github   — GitHub 이슈로 등록 (CI-N → #실번호 2-pass 치환)
  2️⃣  /github-kanban                — Projects v2 보드 생성 + order:NNN 순서 배치
  3️⃣  /implement-top-issue          — CI-1 부터 우선순위 기반 자동 구현 (CI/CD 이슈는 ci-cd-pipeline 위임)
```
