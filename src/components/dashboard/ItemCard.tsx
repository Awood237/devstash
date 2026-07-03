import Link from "next/link";
import { Pin, Star } from "lucide-react";

import { type DashboardItem } from "@/lib/db/items";
import { TypeIcon } from "@/components/dashboard/TypeIcon";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ItemCard({ item }: { item: DashboardItem }) {
  const { type } = item;

  return (
    <Link
      href={`/items/${item.id}`}
      className="bg-card hover:bg-accent/40 flex gap-3 rounded-xl border border-l-4 p-4 transition-colors"
      style={{ borderLeftColor: type.color }}
    >
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
        <TypeIcon name={type.icon} color={type.color} className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate font-medium">{item.title}</h3>
            {item.isPinned && (
              <Pin className="text-muted-foreground size-3.5 shrink-0" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {item.description && (
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
