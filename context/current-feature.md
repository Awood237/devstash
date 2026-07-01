# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- **Dashboard UI Phase 1** — Completed. Scaffolded the dashboard layout (phase 1 of 3). See @context/features/dashboard-phase-1-spec.md.
  - Initialized shadcn/ui (Tailwind v4, CSS-based config) and added `button` + `input` components.
  - Enabled dark mode by default via `className="dark"` on `<html>`; updated app metadata to DevStash.
  - Built `/dashboard` route: `DashboardLayout` shell with `TopBar` (display-only search + New Collection/New Item buttons) and placeholder `Sidebar` / `Main` (h2s).
  - Used `secondary` variant for the New Item button so it isn't white in dark mode.
  - Added DevStash logo + wordmark (gradient tile with lucide `Layers` icon) to the sidebar header.
  - `npm run build` passes; `/dashboard` verified serving 200 with expected content.
