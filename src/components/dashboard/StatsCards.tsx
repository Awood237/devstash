import { FileStack, FolderOpen, Star, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { type DashboardCollection } from "@/lib/db/collections";
import { type ItemStats } from "@/lib/db/items";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function StatsCards({
  collections,
  itemStats,
}: {
  collections: DashboardCollection[];
  itemStats: ItemStats;
}) {
  const stats: Stat[] = [
    {
      label: "Total Items",
      value: itemStats.total,
      icon: FileStack,
      color: "#3b82f6",
    },
    {
      label: "Collections",
      value: collections.length,
      icon: FolderOpen,
      color: "#a855f7",
    },
    {
      label: "Favorite Items",
      value: itemStats.favorites,
      icon: Star,
      color: "#eab308",
    },
    {
      label: "Favorite Collections",
      value: collections.filter((collection) => collection.isFavorite).length,
      icon: Sparkles,
      color: "#22c55e",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card flex items-center gap-3 rounded-xl border p-4"
        >
          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
            <stat.icon color={stat.color} className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
            <p className="text-muted-foreground truncate text-xs">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
