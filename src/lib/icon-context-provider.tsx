"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { IconContext } from "@/lib/icon-context-internal";
import { iconLibraryOrder, type IconLibrary } from "@/lib/icon-map";

export function IconProvider({
  children,
  defaultLibrary = "lucide",
}: {
  children: ReactNode;
  defaultLibrary?: IconLibrary;
}) {
  const [iconLibrary, setIconLibraryState] = useState<IconLibrary>(defaultLibrary);

  const setIconLibrary = useCallback((next: IconLibrary) => {
    setIconLibraryState(next);
  }, []);

  // Global keyboard shortcut: I to cycle icon library
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "i" && e.key !== "I") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setIconLibraryState((prev) => {
        const idx = iconLibraryOrder.indexOf(prev);
        return iconLibraryOrder[(idx + 1) % iconLibraryOrder.length];
      });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <IconContext.Provider value={{ iconLibrary, setIconLibrary }}>
      {children}
    </IconContext.Provider>
  );
}
