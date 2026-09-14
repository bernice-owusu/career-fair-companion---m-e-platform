# AGENTS.md

## Project Overview

Single-package React + Vite + TypeScript mobile-first PWA for career fair registration, booth tracking, reflections, exit surveys, and M&E analytics synced to Google Sheets via Apps Script.

Scaffolded from Google AI Studio, then heavily customized; legacy AI Studio artifacts (metadata.json, firebase-applet-config.json, assets/.aistudio) were removed.

## Commands

- `npm run dev` — Vite dev server on port 3000
- `npm run build` — Production build (Vite)
- `npm run lint` — Runs `tsc --noEmit` (type-check only, no ESLint)
- `npm run clean` — Removes `dist/` and `server.js`

There is no test framework, formatter, or CI pipeline configured.

## Architecture

- **Entry**: `index.html` -> `src/main.tsx` -> `src/App.tsx`
- **Types**: `src/types.ts` — all data models (Participant, Booth, BoothVisit, ExitSurvey, EventConfig, MneMetrics)
- **Storage**: `src/services/storageService.ts` — all state lives in `localStorage` with `kcf_*` keys; includes seed/demo data
- **Sheets sync**: `src/services/googleSheetsService.ts` — webhook-based sync to Google Apps Script web app; also contains the full Apps Script source code as a string literal (`getAppsScriptCode()`)
- **Components**: `src/components/participant/` (registration, check-in, booth directory, progress, profile) and `src/components/admin/` (login, dashboard)
- **No routing library** — flow state managed via `useState` in App.tsx

## Style Guide

- **Primary colors**: `#0a2240` (deep navy), `#ff5c35` (orange accent)
- **Auxiliary colors**: `#135eab` (blue), `#004f51` (teal), `#dce3eb` (light gray)
- **Typefaces**: Myriad Pro Black — bold headlines and captions only; Gill Sans Std — body copy and details
- Applied in code via Tailwind v4 `@theme` tokens in `src/index.css`: `navy`, `orange`, `blue`, `teal`, `mist` (colors) and `font-headline` / `font-body`. `index.html` still loads Plus Jakarta Sans / Space Grotesk from Google Fonts as the concrete fonts behind those tokens; `rose-*` is intentionally reserved for error/destructive styling
- Tailwind palette classes (slate/indigo) are deprecated — use the brand tokens (`bg-navy`, `text-mist/80`, `border-mist/15`, `bg-orange`, `bg-teal`, `text-blue`, etc.); keep `text-white` only for hero numbers and buttons on navy/teal/orange fills

## Key Conventions

- Path alias `@/` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (not PostCSS) — uses `@import "tailwindcss"` in CSS, not the old `@tailwind` directives
- No runtime env vars are required. Optional `DISABLE_HMR=true` (via `.env.local`) makes the dev server skip HMR/file watching; `.env.example` is the reference
- Default admin passcode is `mne2026` (defined in `DEFAULT_CONFIG` in `storageService.ts`)

## Gotchas

- Two lockfiles exist (`package-lock.json` and `bun.lock`) — the project was likely set up with npm; prefer npm commands
- The `clean` script uses `rm -rf` which won't work on native Windows cmd (works in PowerShell/git-bash)
- Google Sheets sync uses `no-cors` fetch mode — errors are silently swallowed and items are queued in localStorage (`CF_SYNC_QUEUE`) for retry
- No `.env.local` file is checked in (`.gitignore` excludes `.env*` except `.env.example`) — only `DISABLE_HMR` is supported and none are required
- **`googleSheetsService.ts`'s `getAppsScriptCode()` generates the Apps Script source as a plain template-literal string — editing it in this repo never touches the live webhook.** A human has to copy the regenerated code from M&E admin → Google Sheets tab and paste it into the Apps Script project's `Code.gs`, then redeploy, before any header/row shape change (new survey questions, new registration fields, etc.) actually reaches the spreadsheet. Confirmed a real, repeatable gap across two separate sessions (the Edition 3 six-fix pass and the later career-transition-questions pass) — always flag this explicitly as an outstanding manual step whenever a change touches `googleSheetsService.ts`'s headers or row-building functions, in both their client-side (TS) and embedded-script (plain-JS string) copies.
- **No existing UI pattern supported a hard "select up to N" multi-choice control before the career-transition-questions work** — `MondaySurveyModal.tsx`'s `MultiChoiceButtons` component (and its near-duplicate local copy added to `ExitSurveyModal.tsx`, following this app's established per-file widget-duplication convention rather than a shared component) now accepts an optional `maxSelections` prop that disables unselected options once the cap is reached. Reuse this shape for any future capped multi-select instead of inventing a new one.
