import { cache } from "react";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

// Until auth is wired up, the dashboard reads the seeded demo user's data.
const DEMO_USER_EMAIL = "demo@devstash.io";

// Fallback border/icon color when a collection has no items (or a type is
// missing its color).
const DEFAULT_COLOR = "#6b7280";

export interface CollectionTypeMeta {
  id: string;
  icon: string;
  color: string;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Border color, derived from the most-used content type in the collection. */
  color: string;
  /** Distinct item types present, ordered most-used first (for icon row). */
  types: CollectionTypeMeta[];
}

/**
 * Fetch the demo user's collections with per-collection type metadata:
 * item count, the distinct types present (for the icon row), and a border
 * color derived from the most-used type. Ordered newest-first.
 */
export const getCollections = cache(async function getCollections(): Promise<
  DashboardCollection[]
> {
  // Read live per-request, not baked in at build time (excludes the DB query
  // from prerendering — the Next 16 way to opt out of static rendering).
  // Wrapped in cache() so the dashboard layout (sidebar) and page share one query.
  await connection();

  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          type: { select: { id: true, icon: true, color: true } },
        },
      },
    },
  });

  return collections.map((collection) => {
    // Tally items per type so we can rank types by usage.
    const tally = new Map<string, { meta: CollectionTypeMeta; count: number }>();
    for (const { type } of collection.items) {
      const existing = tally.get(type.id);
      if (existing) {
        existing.count += 1;
      } else {
        tally.set(type.id, {
          meta: {
            id: type.id,
            icon: type.icon ?? "File",
            color: type.color ?? DEFAULT_COLOR,
          },
          count: 1,
        });
      }
    }

    const ranked = [...tally.values()].sort((a, b) => b.count - a.count);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection.items.length,
      color: ranked[0]?.meta.color ?? DEFAULT_COLOR,
      types: ranked.map((entry) => entry.meta),
    };
  });
});
