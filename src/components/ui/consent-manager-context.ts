import * as React from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConsentCategory = "essential" | "analytics" | "marketing"

export type ConsentPreferences = Record<ConsentCategory, boolean>

type ConsentManagerContextValue = {
  preferences: ConsentPreferences
  updatePreference: (category: ConsentCategory, value: boolean) => void
  acceptAll: () => void
  rejectAll: () => void
  hasResponded: boolean
  open: boolean
  setOpen: (open: boolean) => void
}

const ConsentManagerContext = React.createContext<ConsentManagerContextValue | null>(null)

export function useConsentManager() {
  const ctx = React.useContext(ConsentManagerContext)
  if (!ctx) {
    throw new Error("useConsentManager must be used within a ConsentManagerProvider")
  }
  return ctx
}

export { ConsentManagerContext }
