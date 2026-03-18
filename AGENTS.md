# oh-sdk-dashboard — Agent Guide

## Project Overview
Next.js 14 + TypeScript dashboard for OpenHands SDK metrics sourced from GitHub, PyPI, and daily stored snapshots.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Postgres + Drizzle ORM
- **Testing**: Vitest
- **Linting**: ESLint 8 via `eslint . --ext .ts,.tsx`

## Key Commands
```bash
npm ci               # Install dependencies from lockfile
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint on .ts/.tsx files
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run Vitest suite
```

## Notes
- Path alias `@/*` maps to `src/*`.
- `DATABASE_URL` is optional for local test runs; snapshot fallback tests pass without it.
- Dashboard route-level loading UI lives in `src/app/loading.tsx` and reuses `src/components/dashboard-skeleton.tsx`.
- Dashboard data fetching should prefer partial-failure handling (`Promise.allSettled`) so one upstream API outage does not blank the whole page.
- CI should run `npm run lint` and `npm test` on pull requests and pushes to `main`.
