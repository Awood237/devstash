import { Layers } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Layers className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">DevStash</span>
      </div>
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold">Sidebar</h2>
      </div>
    </aside>
  );
}
