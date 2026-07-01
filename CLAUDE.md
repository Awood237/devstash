# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project runs **Next.js 16** (`next@16.2.9`) with **React 19**. This is newer than most training data — APIs and conventions differ. Before writing any Next.js code, read the relevant guide bundled at `node_modules/next/dist/docs/` (App Router docs live under `01-app/`). Heed deprecation notices.

# DevStash
A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types

## Context Files

Read the following to get the full context of the project

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md


## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test runner configured yet.

