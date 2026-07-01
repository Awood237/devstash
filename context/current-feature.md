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
- **Dashboard UI Phase 2** — Completed. Built out the sidebar (phase 2 of 3). See @context/features/dashboard-phase-2-spec.md.
  - Added `SidebarProvider` (client context) sharing state between the `TopBar` toggle and `Sidebar`: desktop collapse + mobile drawer, with an `isMobile` `matchMedia` check so the toggle collapses the rail on desktop and opens the drawer on mobile.
  - `SidebarContent` holds the shared inner UI: brand header, collapsible **Types** section (links to `/items/{slug}`, colored icon + count), collapsible **Collections** section split into **Favorites** (star) and **Recent** (count), and a bottom user area (avatar/initials, name, email, settings).
  - Type icons are colored per type and collection folders per collection `color` (via lucide's `color` prop, not inline styles); added reusable `TypeIcon` mapping mock-data icon strings to lucide components.
  - Desktop collapse is an icon **rail** (`w-16`) showing brand tile + colored type icons + avatar; collection folders/headers/divider are hidden in the rail (a stack of identical folders is unreadable). Mobile always renders a full-width drawer overlay with a dimmed backdrop.
  - Data imported directly from `src/lib/mock-data.ts`; **Recent** currently uses `collections.slice(0, 5)` since `Collection` has no timestamp yet.
  - `npm run build` and `npm run lint` pass; `/dashboard` verified serving 200 with expected content.
