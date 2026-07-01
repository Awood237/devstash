import { FolderPlus, PanelLeft, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="flex h-16 items-center gap-3 border-b px-4">
      <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
        <PanelLeft className="size-5" />
      </Button>

      <div className="relative mx-auto w-full max-w-xl">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search items..."
          className="pl-9 pr-16"
        />
        <kbd className="text-muted-foreground bg-muted pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-xs sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline">
          <FolderPlus className="size-4" />
          <span className="hidden sm:inline">New Collection</span>
        </Button>
        <Button variant="secondary">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
