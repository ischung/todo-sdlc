# todo-sdlc

[![ci](https://github.com/ischung/todo-sdlc/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ischung/todo-sdlc/actions/workflows/ci.yml)

대학생/취준생을 위한 **개인용 달력 Todo 앱** — SDLC 실습 프로젝트 (PRD → TechSpec → Vertical Slice + CI/CD-first).

## 스택

- **Frontend**: React 18 + TypeScript 5.4 + Vite 5
- **Style**: TailwindCSS 3 (디자인 토큰: `brand` / `surface` / `ink`)
- **Persistence**: Browser `localStorage` (백엔드 없음)
- **Test**: Vitest + React Testing Library + Playwright (E2E)
- **CI/CD**: GitHub Actions + GitHub Pages

## 로컬 실행

```bash
npm install
npm run dev          # 개발 서버 (http://localhost:5173)
```

## 스크립트

| Script | 설명 |
| :---- | :---- |
| `npm run dev` | Vite 개발 서버 |
| `npm run build` | 프로덕션 빌드 (TS 체크 후 `dist/` 출력) |
| `npm run preview` | 빌드 산출물 미리보기 |
| `npm run lint` | ESLint (warning 0 강제) |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run test` | Vitest (단위·통합) |
| `npm run format` | Prettier 일괄 포맷 |

## 문서

- [`prd.md`](./prd.md) — 제품 요구사항
- [`techspec.md`](./techspec.md) — 기술 명세
- [`issues-vertical.md`](./issues-vertical.md) — 이슈 분할 (Vertical Slice + CI/CD-first)

## 기여 규칙

- main 브랜치 직접 푸시 금지 → feature 브랜치 + PR
- PR은 `ci` 워크플로(lint/typecheck/test/build)가 초록불이어야 머지 가능
- 코드 소유자 자동 리뷰 요청: [`.github/CODEOWNERS`](./.github/CODEOWNERS)
