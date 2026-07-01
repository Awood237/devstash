"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Folder, Layers, Settings, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { collections, currentUser, itemTypes } from "@/lib/mock-data";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useSidebar } from "@/components/dashboard/SidebarProvider";

function typeSlug(name: string) {
  return name.toLowerCase();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-sidebar-foreground/60 hover:text-sidebar-foreground flex w-full items-center gap-1 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors"
    >
      {label}
      <ChevronDown
        className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
      />
    </button>
  );
}

export function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const { closeMobile } = useSidebar();
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.slice(0, 5);

  // In the collapsed rail we show the (distinct, colored) type icons only —
  // a stack of identical collection folders is unreadable, so it's hidden.
  const showTypes = collapsed || typesOpen;
  const showCollections = !collapsed && collectionsOpen;

  const linkClass = cn(
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center rounded-md text-sm transition-colors",
    collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
  );

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "gap-2 px-4",
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Layers className="size-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">DevStash</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {/* Types */}
        {!collapsed && (
          <SectionHeader
            label="Types"
            open={typesOpen}
            onToggle={() => setTypesOpen((v) => !v)}
          />
        )}
        {showTypes && (
          <ul className="mt-1 space-y-0.5">
            {itemTypes.map((type) => (
              <li key={type.id}>
                <Link
                  href={`/items/${typeSlug(type.name)}`}
                  onClick={closeMobile}
                  className={linkClass}
                  title={collapsed ? `${type.name} (${type.count})` : undefined}
                >
                  <TypeIcon
                    name={type.icon}
                    color={type.color}
                    className="size-4 shrink-0"
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{type.name}</span>
                      <span className="text-sidebar-foreground/50 text-xs">
                        {type.count}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!collapsed && <div className="bg-sidebar-border my-3 h-px" />}

        {/* Collections */}
        {!collapsed && (
          <SectionHeader
            label="Collections"
            open={collectionsOpen}
            onToggle={() => setCollectionsOpen((v) => !v)}
          />
        )}
        {showCollections && (
          <div className={cn(collapsed ? "space-y-0.5" : "mt-1 space-y-3")}>
            {favoriteCollections.length > 0 && (
              <div>
                {!collapsed && (
                  <p className="text-sidebar-foreground/40 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                    Favorites
                  </p>
                )}
                <ul className="space-y-0.5">
                  {favoriteCollections.map((collection) => (
                    <li key={collection.id}>
                      <Link
                        href={`/collections/${collection.id}`}
                        onClick={closeMobile}
                        className={linkClass}
                        title={collapsed ? collection.name : undefined}
                      >
                        <Folder
                          color={collection.color}
                          className="size-4 shrink-0"
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">
                              {collection.name}
                            </span>
                            <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                          </>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              {!collapsed && (
                <p className="text-sidebar-foreground/40 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                  Recent
                </p>
              )}
              <ul className="space-y-0.5">
                {recentCollections.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      href={`/collections/${collection.id}`}
                      onClick={closeMobile}
                      className={linkClass}
                      title={collapsed ? collection.name : undefined}
                    >
                      <Folder
                        color={collection.color}
                        className="size-4 shrink-0"
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">
                            {collection.name}
                          </span>
                          <span className="text-sidebar-foreground/50 text-xs">
                            {collection.itemCount}
                          </span>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div
        className={cn(
          "flex shrink-0 items-center border-t py-3",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        {currentUser.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUser.image}
            alt={currentUser.name}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="bg-sidebar-accent text-sidebar-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
            title={collapsed ? currentUser.name : undefined}
          >
            {initials(currentUser.name)}
          </div>
        )}
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="text-sidebar-foreground/50 truncate text-xs">
                {currentUser.email}
              </p>
            </div>
            <button
              type="button"
              aria-label="Settings"
              className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md p-1.5 transition-colors"
            >
              <Settings className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
