import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

// Until auth is wired up, the dashboard reads the seeded demo user's data.
const DEMO_USER_EMAIL = "demo@devstash.io";

// Fallback icon/border color when an item's type has no color set.
const DEFAULT_COLOR = "#6b7280";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  /** Type metadata drives the card's icon and left border. */
  type: { icon: string; color: string };
  tags: string[];
}

export interface ItemStats {
  total: number;
  favorites: number;
}

export interface SidebarItemType {
  id: string;
  /** Display name, e.g. "Snippet". */
  name: string;
  /** URL slug for /items/[slug], e.g. "snippet". */
  slug: string;
  icon: string;
  color: string;
  /** Number of the demo user's items of this type. */
  count: number;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Shared shape for the item + relations we select, so the mapper is typed.
const itemSelect = {
  id: true,
  title: true,
  description: true,
  isPinned: true,
  isFavorite: true,
  createdAt: true,
  type: { select: { icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  type: { icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
};

function toDashboardItem(item: ItemRow): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    createdAt: item.createdAt,
    type: {
      icon: item.type.icon ?? "File",
      color: item.type.color ?? DEFAULT_COLOR,
    },
    tags: item.tags.map((t) => t.tag.name),
  };
}

/** The demo user's pinned items, newest-first. */
export async function getPinnedItems(): Promise<DashboardItem[]> {
  await connection();

  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL }, isPinned: true },
    orderBy: { createdAt: "desc" },
    select: itemSelect,
  });

  return items.map(toDashboardItem);
}

/** The demo user's most recent items, newest-first. */
export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  await connection();

  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: itemSelect,
  });

  return items.map(toDashboardItem);
}

/**
 * The system item types for the sidebar, each with a count of the demo user's
 * items of that type. Includes types with zero items (navigation), ordered by
 * count (most items first), ties broken alphabetically by name.
 */
export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  await connection();

  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: {
        select: { items: { where: { user: { email: DEMO_USER_EMAIL } } } },
      },
    },
  });

  return types
    .map((type) => ({
      id: type.id,
      name: capitalize(type.name),
      slug: type.name.toLowerCase(),
      icon: type.icon ?? "File",
      color: type.color ?? DEFAULT_COLOR,
      count: type._count.items,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Total and favorite item counts for the demo user. */
export async function getItemStats(): Promise<ItemStats> {
  await connection();

  const where = { user: { email: DEMO_USER_EMAIL } };
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.count({ where: { ...where, isFavorite: true } }),
  ]);

  return { total, favorites };
}
