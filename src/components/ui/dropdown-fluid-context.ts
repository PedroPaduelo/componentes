"use client";

import { createContext, useContext } from "react";

export interface DropdownFluidContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  checkedIndex?: number;
}

export const DropdownFluidContext =
  createContext<DropdownFluidContextValue | null>(null);

export function useDropdownFluid() {
  const ctx = useContext(DropdownFluidContext);
  if (!ctx) throw new Error("useDropdownFluid must be used within a DropdownFluid");
  return ctx;
}
