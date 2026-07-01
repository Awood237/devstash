"use client";

import { cn } from "@/lib/utils";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { useSidebar } from "@/components/dashboard/SidebarProvider";

export function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop: static rail, collapses to a narrow icon rail at md+ */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r transition-[width] duration-200 ease-in-out md:block",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile: drawer overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={closeMobile}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 border-r shadow-xl transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}
