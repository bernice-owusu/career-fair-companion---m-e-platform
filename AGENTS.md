# AGENTS.md

## Project Overview

Single-package React + Vite + TypeScript mobile-first PWA for career fair registration, booth tracking, reflections, exit surveys, and M&E analytics synced to Google Sheets via Apps Script.

Originally generated from Google AI Studio (see `metadata.json`, `firebase-applet-config.json`).

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
- `GEMINI_API_KEY` and `APP_URL` env vars come from AI Studio at runtime; `.env.example` is the reference
- HMR can be disabled via `DISABLE_HMR=true` env var (AI Studio uses this to prevent flickering during agent edits)
- `firebase-applet-config.json` contains API keys that are AI Studio-managed, not secrets to protect
- Default admin passcode is `mne2026` (defined in `DEFAULT_CONFIG` in `storageService.ts`)

## Gotchas

- Two lockfiles exist (`package-lock.json` and `bun.lock`) — the project was likely set up with npm; prefer npm commands
- The `clean` script uses `rm -rf` which won't work on native Windows cmd (works in PowerShell/git-bash)
- Google Sheets sync uses `no-cors` fetch mode — errors are silently swallowed and items are queued in localStorage (`CF_SYNC_QUEUE`) for retry
- `EntranceQRPresenter` component is imported but commented out in `App.tsx`
- No `.env.local` file is checked in (`.gitignore` excludes `.env*` except `.env.example`) — create it manually with your `GEMINI_API_KEY` if needed locally
