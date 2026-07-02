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
- **Dashboard UI Phase 3** — Completed. Built out the main area (phase 3 of 3). See @context/features/dashboard-phase-3-spec.md.
  - Filled in `DashboardPage`: header + subtitle, then Stats, Collections, Pinned, and Recent sections; wrapped in a `max-w-6xl` container. Kept as a server component (no `"use client"`).
  - `StatsCards`: 4 cards (Total Items, Collections, Favorite Items, Favorite Collections) computed from mock data; not in the screenshot, per spec.
  - `CollectionCard`: colored left border + type-icon row (per collection `color`/`typeIds`), star on favorites, item count, description; hover reveals a `MoreHorizontal` menu affordance.
  - `ItemCard` (shared by Pinned + Recent): type-colored icon tile + left border, pin/star badges, `Jan 15`-style date (UTC-safe), description, and tag pills.
  - Page shows all 6 collections, pinned items, and the 10 most recent items (only 7 exist, sorted newest-first); added `getItemType(typeId)` lookup helper to `mock-data.ts`.
  - Data-driven hex colors use inline `style` only where unavoidable (card left borders); everything else is Tailwind + lucide's `color` prop.
  - `npm run build` and `npm run lint` pass; `/dashboard` verified serving 200, and a headless-Chrome screenshot matched the reference layout.
- **Prisma + Neon PostgreSQL Setup** — Completed. Set up Prisma 7 ORM against a serverless Neon Postgres DB with the full initial schema. See @context/features/database-spec.md.
  - Upgraded Node to **v26** via nvm — Prisma 7 hard-requires Node ≥20.19 and refused to install on the prior v20.9.0. (Note: nvm only activates in interactive shells; the system `/usr/local/bin/node` still shadows it non-interactively.)
  - Installed **Prisma 7.8.0** with the required driver-adapter stack: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv` (+ `tsx` for seeding).
  - Prisma 7 specifics applied: `prisma-client` generator (not `prisma-client-js`) with mandatory `output` → `src/generated/prisma`; datasource `url` moved out of the schema into `prisma.config.ts` (`directUrl` removed in v7); client imported from the generated path; a `PrismaPg` driver adapter is now required to instantiate `PrismaClient`.
  - `prisma/schema.prisma`: full DevStash model from project-overview — domain (`Item`, `ItemType`, `Collection`, `Tag`, `ItemTag` + `ContentType` enum), NextAuth v5 (`Account`, `Session`, `VerificationToken` + `emailVerified`/`image` on `User`), FK indexes, `@@unique` constraints, and cascade/set-null rules.
  - `src/lib/prisma.ts`: singleton `PrismaClient` (global reuse in dev) built on the `PrismaPg` adapter reading `DATABASE_URL`.
  - Config/wiring: `.env` (gitignored) + committed `.env.example`; gitignore for the generated client with a `!.env.example` exception; ESLint ignores `src/generated/**`; added `postinstall: prisma generate` + `db:migrate`/`db:deploy`/`db:studio` scripts.
  - Migration: created and applied `migrations/…_init` against the Neon **dev** branch over the **direct (unpooled)** connection (the pooler can break migration DDL). `prisma migrate status` reports in sync; verified all 10 tables via the `pg` driver.
  - Seed: `prisma/seed.ts` (run via `prisma db seed` → `tsx`) upserts the **7 system `ItemType`s** (`isSystem=true`, `userId=null`) by `id`, matching the mock-data ids/icons/colors; idempotent because the `@@unique([userId,name])` constraint can't dedupe null-user system types.
  - `prisma validate`, `prisma generate`, `npm run build`, and `npm run lint` all pass.
