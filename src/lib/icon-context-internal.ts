"use client";

import { createContext, useContext, useMemo } from "react";

import {
  iconMap,
  type IconLibrary,
  type IconName,
  type IconComponent,
} from "@/lib/icon-map";

export interface IconContextValue {
  iconLibrary: IconLibrary;
  setIconLibrary: (lib: IconLibrary) => void;
}

export const IconContext = createContext<IconContextValue | null>(null);

/**
 * Returns the current icon library and setter.
 * Throws if used outside IconProvider.
 */
export function useIconLibrary() {
  const ctx = useContext(IconContext);
  if (!ctx) throw new Error("useIconLibrary must be used within an IconProvider");
  return ctx;
}

/**
 * Returns a single icon component for the given name.
 * Falls back to Lucide if no provider is present.
 */
export function useIcon(name: IconName): IconComponent {
  const ctx = useContext(IconContext);
  if (!ctx) return iconMap.lucide[name];
  return iconMap[ctx.iconLibrary][name];
}

/**
 * Returns the full icon map for the current library.
 * Falls back to Lucide if no provider is present.
 */
export function useIcons(): Record<IconName, IconComponent> {
  const ctx = useContext(IconContext);
  const lib = ctx?.iconLibrary ?? "lucide";
  return useMemo(() => iconMap[lib], [lib]);
}
