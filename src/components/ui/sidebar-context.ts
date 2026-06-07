import { createContext, useContext } from "react"
import type React from "react"

export interface SidebarLinkItem {
  label: string
  href: string
  icon: React.ReactNode
}

export interface SidebarContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
)

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
