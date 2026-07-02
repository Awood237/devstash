import Link from "next/link";
import { MoreHorizontal, Star } from "lucide-react";

import { getItemType, type Collection } from "@/lib/mock-data";
import { TypeIcon } from "@/components/dashboard/TypeIcon";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="bg-card hover:bg-accent/40 group relative flex flex-col gap-3 rounded-xl border border-l-4 p-5 transition-colors"
      style={{ borderLeftColor: collection.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold">{collection.name}</h3>
            {collection.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {collection.itemCount} items
          </p>
        </div>
        <MoreHorizontal className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {collection.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {collection.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        {collection.typeIds.map((typeId) => {
          const type = getItemType(typeId);
          if (!type) return null;
          return (
            <TypeIcon
              key={typeId}
              name={type.icon}
              color={type.color}
              className="size-4"
            />
          );
        })}
      </div>
    </Link>
  );
}
