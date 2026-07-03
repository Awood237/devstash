# Current Feature

Dashboard Items — replace the dummy item data (Pinned + Recent) in the dashboard main area with real data from the Neon database via Prisma. See @context/features/dashboard-items-spec.md.

## Status

Completed

## Goals

- Replace the mock item data (`src/lib/mock-data.ts`) for both the **Pinned** and **Recent** sections of the dashboard main area with real data fetched from the Neon database via Prisma.
- Keep the current design/layout, matching `@context/screenshots/dashboard-ui-main.png`.
- Create `src/lib/db/items.ts` with the data-fetching functions.
- Fetch items directly in the server component.
- Derive each item card's icon/border from the item's type.
- Display item type tags and everything else currently shown on the card.
- If there are no pinned items, render nothing in the Pinned section.
- Update the (item-related) stats display so Total Items / Favorite Items come from the DB.

## Notes

- Spec: @context/features/dashboard-items-spec.md
- Builds on the Dashboard Collections feature (`src/lib/db/collections.ts`, `TypeIcon`, dynamic rendering via `connection()`); mirror that data-access pattern for items.

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
- **Seed Sample Data** — Completed. Rewrote `prisma/seed.ts` to populate the dev database with demo data. See @context/features/seed-spec.md.
  - Added `name String?` to the `User` model (the spec's demo user needs a name; the model lacked one) and created migration `…_add_user_name`. Cross-checked Brad's final `bradtraversy/devstash` repo — he also adds `name`; his other schema differences (`itemTypeId`, `ContentType.URL`, `Collection.defaultTypeId`, an `ItemCollection` join table, `editorPreferences`, `@@map`) belong to later lectures and were intentionally **not** pulled in.
  - Installed `bcryptjs` (+ `@types/bcryptjs`); demo user `demo@devstash.io` / `Demo User`, password `12345678` hashed with bcrypt (12 rounds), `isPro: false`, `emailVerified: now`.
  - System item types updated to the spec's canonical set (singular names, new icons/colors: `snippet/Code`, `prompt/Sparkles`, `command/Terminal`, `note/StickyNote`, `file/File`, `image/Image`, `link/Link`); still upserted by stable id to avoid null-userId duplicates.
  - Adapted the data to **our current schema** (not Brad's final one): items use `typeId` (not `itemTypeId`); links use `contentType: text` + the `url` field (our `ContentType` has no `URL`); each item has a single `collectionId` (no join table).
  - Followed seed-spec's **5 collections** (React Patterns⭐, AI Workflows⭐, DevOps, Terminal Commands, Design Resources) with **18 items** total (3/3/4/4/4) — Brad's final seed only made 3 and left items unlinked, which doesn't fit our one-collection-per-item model.
  - Seed is idempotent: upserts types + user, deletes the demo user's existing items then collections, and recreates. Run via `npm run db:seed`-equivalent `prisma db seed` (→ `tsx`).
  - Gotcha: `prisma migrate dev` did not refresh the generated client, so the first seed failed on `Unknown argument name`; an explicit `prisma generate` fixed it. Verified 1 user / 7 types / 5 collections / 18 items in Neon; `npm run build` and `npm run lint` pass.
- **Dashboard Collections** — Completed. Replaced the mock collection data in the dashboard main area with live data from Neon via Prisma. See @context/features/dashboard-collections-spec.md.
  - Added `src/lib/db/collections.ts` with `getCollections()` + exported `DashboardCollection` / `CollectionTypeMeta` types. Fetches the seeded demo user's collections (`demo@devstash.io`, hardcoded until auth exists), newest-first, including each item's `type` (id/icon/color).
  - Per collection it tallies items by type to derive: `itemCount`, `types` (distinct types ordered most-used-first, for the icon row), and `color` (border = most-used type's color, `#6b7280` fallback when empty).
  - `page.tsx` is now an async server component that awaits `getCollections()`; passes the list to `StatsCards` and slices the first 6 for cards. **Pinned/Recent items still use mock data** (deferred per spec).
  - `StatsCards` now takes a `collections` prop — Collections + Favorite Collections come from the DB; Total/Favorite **Items** stay on mock until items are wired up.
  - `CollectionCard` switched from the mock `Collection` + `getItemType()` lookup to `DashboardCollection` with embedded `types`.
  - `TypeIcon`: added `Code`, `Terminal`, `StickyNote` to the icon map — the DB seed stores those names, which weren't in the mock-data set (would have silently fallen back to `File`).
  - Made the route dynamic the Next 16 way: `await connection()` inside `getCollections()` (not `export const dynamic`), so the DB read runs per-request instead of being baked in at build (`/dashboard` now builds as `ƒ Dynamic`).
  - Verified against the running dev server: main area shows the 5 real collections with correct counts (React Patterns 3, AI Workflows 3, DevOps 4, Terminal Commands 4, Design Resources 4), most-used-type border colors (e.g. DevOps→link green with 2 links), and type icons. `npm run build` and `npm run lint` pass. Sidebar collections remain on mock data (out of scope).
- **Dashboard Items** — Completed. Replaced the mock item data in the dashboard's Pinned + Recent sections with live data from Neon via Prisma. See @context/features/dashboard-items-spec.md.
  - Added `src/lib/db/items.ts` (mirrors `collections.ts`): `getPinnedItems()`, `getRecentItems(limit = 10)`, `getItemStats()`, plus exported `DashboardItem` / `ItemStats` types. A shared `itemSelect` + `toDashboardItem` mapper keeps the three queries consistent; each awaits `connection()` so reads run per-request. Scoped to the seeded demo user (`demo@devstash.io`) until auth exists.
  - Each item embeds its `type` (icon/color) for the card's icon tile + left border, and flattens the `ItemTag`→`Tag` join to `string[]` tags (no tags seeded yet, so pills are empty but supported).
  - `page.tsx` now fetches collections, pinned, recent, and item stats together via `Promise.all`. Pinned section keeps its `pinnedItems.length > 0` guard, so it renders nothing when there are none.
  - `StatsCards` now takes an `itemStats` prop — Total Items / Favorite Items come from the DB (`count`), no longer from mock-data. Combined with the earlier collections work, all 4 stat cards are now DB-backed.
  - `ItemCard` switched from the mock `Item` + `getItemType()` lookup to `DashboardItem` with an embedded `type`; `formatDate` now takes a `Date` (Prisma `createdAt`) instead of an ISO string.
  - The dashboard page and its cards no longer import `mock-data`; only the sidebar still uses it (out of scope).
  - Verified on the dev server: stats 18/5/2/2; Pinned shows the 2 seeded pinned items (`useDebounce Hook`, `Git Undo Last Commit`) with pin badges; Recent shows 10 newest items; icons/borders match each item's type. `npm run build` and `npm run lint` pass; `/dashboard` builds as `ƒ Dynamic`.
