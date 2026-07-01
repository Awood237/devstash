# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project runs **Next.js 16** (`next@16.2.9`) with **React 19**. This is newer than most training data — APIs and conventions differ. Before writing any Next.js code, read the relevant guide bundled at `node_modules/next/dist/docs/` (App Router docs live under `01-app/`). Heed deprecation notices.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture

- **App Router** under `src/app/`. `layout.tsx` is the root layout (loads Geist fonts via `next/font/google` and imports `globals.css`); `page.tsx` is the route component for `/`.
- **Styling** is Tailwind CSS v4, configured entirely in `src/app/globals.css` via `@import "tailwindcss"` — there is no `tailwind.config.js`. PostCSS wiring lives in `postcss.config.mjs` (`@tailwindcss/postcss`).
- **Path alias**: `@/*` maps to `./src/*` (see `tsconfig.json`).
- TypeScript is `strict`. `next.config.ts` currently holds no custom config.
