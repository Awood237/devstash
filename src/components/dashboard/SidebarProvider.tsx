"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarContextValue {
  /** Desktop: whether the sidebar is collapsed (hidden) at md+ breakpoints. */
  collapsed: boolean;
  /** Mobile: whether the drawer overlay is open. */
  mobileOpen: boolean;
  isMobile: boolean;
  /** Toggles the drawer on mobile, or the collapse state on desktop. */
  toggle: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const MOBILE_QUERY = "(max-width: 767px)";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      setIsMobile(mql.matches);
      // Closing the drawer when growing to desktop avoids a stuck overlay.
      if (!mql.matches) setMobileOpen(false);
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((value) => !value);
    }
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, isMobile, toggle, closeMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
