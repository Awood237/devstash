# Current Feature

Stats & Sidebar — show the main-area stats, the system item types, and the real collection data in the sidebar from the Neon database instead of `src/lib/mock-data.ts`. See @context/features/stats-sidebar-spec.md.

## Status

Completed

## Goals

- Display the main-area stats from database data, keeping the current design/layout.
- Display item types in the sidebar with their icons, linking to `/items/[typename]`.
- Add a "View all collections" link under the collections list that goes to `/collections`.
- Keep the star icons for favorite collections, but for recents show a colored circle based on the most-used item type in each collection.
- Create `src/lib/db/items.ts` and add the database functions (use `src/lib/db/collections.ts` for reference).

## Notes

- Spec: @context/features/stats-sidebar-spec.md
- Reference: @context/db/collections.ts pattern — mirror the `connection()` per-request dynamic rendering and demo-user scoping used for collections/items.

## History

> Completed features, earliest → latest. Each links its spec; details are collapsed for scanning.

---

### ✅ Dashboard UI — Phase 1: Layout scaffold

**Spec:** @context/features/dashboard-phase-1-spec.md

- Initialized shadcn/ui (Tailwind v4, CSS-based config) and added `button` + `input` components.
- Enabled dark mode by default via `className="dark"` on `<html>`; updated app metadata to DevStash.
- Built `/dashboard` route: `DashboardLayout` shell with `TopBar` (display-only search + New Collection/New Item buttons) and placeholder `Sidebar` / `Main`.
- Used `secondary` variant for the New Item button so it isn't white in dark mode.
- Added DevStash logo + wordmark (gradient tile with lucide `Layers` icon) to the sidebar header.
- ✔ `npm run build` passes; `/dashboard` verified serving 200.

---

### ✅ Dashboard UI — Phase 2: Sidebar

**Spec:** @context/features/dashboard-phase-2-spec.md

- `SidebarProvider` (client context) shares state between the `TopBar` toggle and `Sidebar`: desktop collapse + mobile drawer, with an `isMobile` `matchMedia` check.
- `SidebarContent` holds the shared inner UI: brand header, collapsible **Types** section (links to `/items/{slug}`, colored icon + count), collapsible **Collections** section split into **Favorites** (star) and **Recent** (count), and a bottom user area.
- Type icons colored per type, collection folders per collection `color` (lucide's `color` prop, not inline styles); added reusable `TypeIcon` mapping icon strings to lucide components.
- Desktop collapse is an icon **rail** (`w-16`); collection folders/headers hidden in the rail. Mobile renders a full-width drawer overlay with a dimmed backdrop.
- Data from `src/lib/mock-data.ts`; **Recent** uses `collections.slice(0, 5)` since `Collection` has no timestamp yet.
- ✔ `npm run build` and `npm run lint` pass; `/dashboard` verified serving 200.

---

### ✅ Dashboard UI — Phase 3: Main area

**Spec:** @context/features/dashboard-phase-3-spec.md

- Filled in `DashboardPage`: header + subtitle, then Stats, Collections, Pinned, and Recent sections in a `max-w-6xl` container. Server component (no `"use client"`).
- `StatsCards`: 4 cards (Total Items, Collections, Favorite Items, Favorite Collections) computed from mock data.
- `CollectionCard`: colored left border + type-icon row, star on favorites, item count, description; hover reveals a `MoreHorizontal` menu.
- `ItemCard` (shared by Pinned + Recent): type-colored icon tile + left border, pin/star badges, `Jan 15`-style date (UTC-safe), description, tag pills.
- Shows all 6 collections, pinned items, and the 10 most recent items; added `getItemType(typeId)` helper to `mock-data.ts`.
- Data-driven hex colors use inline `style` only where unavoidable (card left borders).
- ✔ `npm run build` and `npm run lint` pass; headless-Chrome screenshot matched the reference layout.

---

### ✅ Prisma + Neon PostgreSQL setup

**Spec:** @context/features/database-spec.md

- Upgraded Node to **v26** via nvm — Prisma 7 requires Node ≥20.19. (nvm only activates in interactive shells; system `/usr/local/bin/node` still shadows it non-interactively.)
- Installed **Prisma 7.8.0** with the driver-adapter stack: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv` (+ `tsx` for seeding).
- Prisma 7 specifics: `prisma-client` generator with mandatory `output` → `src/generated/prisma`; datasource `url` moved into `prisma.config.ts` (`directUrl` removed in v7); a `PrismaPg` driver adapter is required to instantiate `PrismaClient`.
- `prisma/schema.prisma`: full DevStash model — domain (`Item`, `ItemType`, `Collection`, `Tag`, `ItemTag` + `ContentType` enum), NextAuth v5 (`Account`, `Session`, `VerificationToken` + `emailVerified`/`image`), FK indexes, `@@unique` constraints, cascade/set-null rules.
- `src/lib/prisma.ts`: singleton `PrismaClient` (global reuse in dev) on the `PrismaPg` adapter reading `DATABASE_URL`.
- Config: `.env` (gitignored) + committed `.env.example`; ESLint ignores `src/generated/**`; added `postinstall: prisma generate` + `db:migrate`/`db:deploy`/`db:studio` scripts.
- Migration `…_init` applied against the Neon **dev** branch over the **direct (unpooled)** connection (the pooler can break migration DDL). Verified all 10 tables.
- Seed upserts the **7 system `ItemType`s** (`isSystem=true`, `userId=null`) by `id`.
- ✔ `prisma validate`, `prisma generate`, `npm run build`, `npm run lint` all pass.

---

### ✅ Seed sample data

**Spec:** @context/features/seed-spec.md

- Added `name String?` to `User` (migration `…_add_user_name`). Cross-checked Brad's final repo — he also adds `name`; his other schema differences (`itemTypeId`, `ContentType.URL`, `Collection.defaultTypeId`, `ItemCollection` join table, etc.) belong to later lectures and were intentionally **not** pulled in.
- Installed `bcryptjs`; demo user `demo@devstash.io` / `Demo User`, password `12345678` (bcrypt, 12 rounds), `isPro: false`.
- System item types set to the canonical singular names/icons (`snippet/Code`, `prompt/Sparkles`, `command/Terminal`, `note/StickyNote`, `file/File`, `image/Image`, `link/Link`); upserted by stable id.
- Adapted to **our current schema** (not Brad's final one): items use `typeId`; links use `contentType: text` + `url`; single `collectionId` per item (no join table).
- **5 collections** (React Patterns⭐, AI Workflows⭐, DevOps, Terminal Commands, Design Resources), **18 items** (3/3/4/4/4).
- Seed is idempotent: upserts types + user, deletes the demo user's items then collections, recreates.
- ⚠ Gotcha: `prisma migrate dev` didn't refresh the generated client → first seed failed on `Unknown argument name`; explicit `prisma generate` fixed it.
- ✔ Verified 1 user / 7 types / 5 collections / 18 items in Neon; `npm run build` and `npm run lint` pass.

---

### ✅ Dashboard Collections

**Spec:** @context/features/dashboard-collections-spec.md

- Added `src/lib/db/collections.ts` with `getCollections()` + exported `DashboardCollection` / `CollectionTypeMeta` types. Fetches the demo user's collections (hardcoded until auth exists), newest-first, including each item's `type`.
- Per collection, tallies items by type to derive `itemCount`, `types` (distinct, most-used-first), and `color` (border = most-used type's color, `#6b7280` fallback).
- `page.tsx` is now an async server component awaiting `getCollections()`. **Pinned/Recent items still on mock data** (deferred).
- `StatsCards` takes a `collections` prop — Collections + Favorite Collections from the DB; Items still on mock.
- `CollectionCard` switched to `DashboardCollection` with embedded `types`.
- `TypeIcon`: added `Code`, `Terminal`, `StickyNote` to the map (DB seed stores those names).
- Route made dynamic the Next 16 way: `await connection()` inside `getCollections()` (not `export const dynamic`), so the DB read runs per-request (`/dashboard` → `ƒ Dynamic`).
- ✔ Verified real counts + border colors on the dev server; `npm run build` and `npm run lint` pass.

---

### ✅ Dashboard Items

**Spec:** @context/features/dashboard-items-spec.md

- Added `src/lib/db/items.ts` (mirrors `collections.ts`): `getPinnedItems()`, `getRecentItems(limit = 10)`, `getItemStats()`, plus `DashboardItem` / `ItemStats` types. Shared `itemSelect` + `toDashboardItem` mapper; each awaits `connection()`. Scoped to the demo user.
- Each item embeds its `type` (icon/color) and flattens the `ItemTag`→`Tag` join to `string[]` tags.
- `page.tsx` fetches collections, pinned, recent, and item stats via `Promise.all`. Pinned section keeps its `pinnedItems.length > 0` guard.
- `StatsCards` takes an `itemStats` prop — Total/Favorite Items from the DB `count`. All 4 stat cards now DB-backed.
- `ItemCard` switched to `DashboardItem` with embedded `type`; `formatDate` now takes a `Date`.
- Dashboard page + cards no longer import `mock-data`; only the sidebar still does (out of scope).
- ✔ Verified stats 18/5/2/2, pinned/recent render correctly; `npm run build` and `npm run lint` pass; `/dashboard` → `ƒ Dynamic`.

---

### ✅ Stats & Sidebar

**Spec:** @context/features/stats-sidebar-spec.md

- Main-area stats were already DB-backed (from Dashboard Collections + Items), so this feature was scoped to the **sidebar**, which was still on `mock-data`.
- Added `getSidebarItemTypes()` to `src/lib/db/items.ts`: the 7 system item types (`isSystem: true`) with a per-demo-user filtered `_count` of items, ordered by name. Returns `SidebarItemType` (display `name` capitalized, lowercase `slug`, icon/color, count) — includes zero-count types for navigation.
- Sidebar data now flows from the server: `layout.tsx` is async, fetches types + collections via `Promise.all`, and passes them as props through `Sidebar` → `SidebarContent` (both `"use client"`). Removed the `itemTypes`/`collections` mock imports; only `currentUser` stays on mock (no auth yet).
- Item types render with their icons, linking to `/items/[slug]`; the type slug now comes from the DB (`type.slug`) instead of the old `typeSlug(name)` helper.
- **Favorites** keep the folder + star. **Recents** now show a colored circle keyed to the collection's most-used item type (`DashboardCollection.color`) instead of a folder icon.
- Added a **"View all collections"** link under the collections list → `/collections` (expanded sidebar only).
- Wrapped `getCollections()` in React `cache()` so the layout (sidebar) and page share one query per request instead of two.
- Sidebar types are ordered by item count (most first), ties broken alphabetically by name — sorted in JS after the query (`_count` isn't a real column, so it can't be ordered in Prisma), so the DB `orderBy` was dropped.
- ✔ Verified on the dev server: 7 type links (`/items/snippet`…), colored circles on 5 recents, favorite stars, and the View-all link all render; `npm run build` and `npm run lint` pass; `/dashboard` stays `ƒ Dynamic`.
