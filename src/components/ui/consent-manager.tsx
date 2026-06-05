import * as React from "react"
import { cn } from "@/lib/utils"
import { consentManagerVariants } from "@/components/ui/consent-manager-variants"
import { ConsentManagerContext, useConsentManager } from "@/components/ui/consent-manager-context"
import type { ConsentCategory, ConsentPreferences } from "@/components/ui/consent-manager-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ConsentCategory, ConsentPreferences } from "@/components/ui/consent-manager-context"

export type ConsentPosition = "bottom-right" | "bottom-left"

const STORAGE_KEY = "consent-manager-prefs"

const DEFAULT_PREFERENCES: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
}



// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface ConsentManagerProviderProps {
  children: React.ReactNode
  /** Posição do botão flutuante. @default "bottom-right" */
  position?: ConsentPosition
}

function ConsentManagerProvider({
  children,
  position = "bottom-right",
}: ConsentManagerProviderProps) {
  const [preferences, setPreferences] = React.useState<ConsentPreferences>(DEFAULT_PREFERENCES)
  const [hasResponded, setHasResponded] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Read localStorage only after mount (SSR safety)
  React.useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentPreferences
        setPreferences(parsed)
        setHasResponded(true)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const updatePreference = React.useCallback(
    (category: ConsentCategory, value: boolean) => {
      setPreferences((prev) => {
        const next = { ...prev, [category]: value }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore write errors
        }
        return next
      })
      setHasResponded(true)
    },
    []
  )

  const acceptAll = React.useCallback(() => {
    const all: ConsentPreferences = { essential: true, analytics: true, marketing: true }
    setPreferences(all)
    setHasResponded(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    } catch {
      // ignore
    }
  }, [])

  const rejectAll = React.useCallback(() => {
    const rejected: ConsentPreferences = { essential: true, analytics: false, marketing: false }
    setPreferences(rejected)
    setHasResponded(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rejected))
    } catch {
      // ignore
    }
  }, [])

  const value = React.useMemo(
    () => ({
      preferences,
      updatePreference,
      acceptAll,
      rejectAll,
      hasResponded,
      open,
      setOpen,
    }),
    [preferences, updatePreference, acceptAll, rejectAll, hasResponded, open]
  )

  return (
    <ConsentManagerContext.Provider value={value}>
      {children}
      {mounted && <ConsentManagerButton position={position} />}
    </ConsentManagerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Floating Button
// ---------------------------------------------------------------------------

interface ConsentManagerButtonProps {
  position?: ConsentPosition
}

function ConsentManagerButton({ position = "bottom-right" }: ConsentManagerButtonProps) {
  const { setOpen } = useConsentManager()

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        consentManagerVariants({ position }),
        "fixed z-50 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-accent hover:text-accent-foreground"
      )}
      aria-label="Gerenciar cookies"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-1.1.9-2 2-2" />
        <path d="M8.5 8.5v.01" />
        <path d="M16 15.5v.01" />
        <path d="M12 12v.01" />
        <path d="M11 17v.01" />
        <path d="M7 14v.01" />
      </svg>
      <span className="hidden sm:inline">Cookies</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Toggle Switch (inline, no extra dep)
// ---------------------------------------------------------------------------

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

function Switch({ checked, onCheckedChange, disabled, id }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Category descriptions
// ---------------------------------------------------------------------------

const CATEGORY_INFO: Record<ConsentCategory, { label: string; description: string }> = {
  essential: {
    label: "Essencial",
    description:
      "Cookies necessários para o funcionamento básico do site. Não podem ser desativados.",
  },
  analytics: {
    label: "Analytics",
    description:
      "Nos ajudam a entender como você usa o site, coletando informações de forma anônima.",
  },
  marketing: {
    label: "Marketing",
    description:
      "Usados para personalizar anúncios e medir a eficácia de campanhas publicitárias.",
  },
}

// ---------------------------------------------------------------------------
// Consent Dialog
// ---------------------------------------------------------------------------

function ConsentDialog() {
  const { preferences, updatePreference, acceptAll, rejectAll, open, setOpen } = useConsentManager()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" data-slot="consent-manager-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-1.1.9-2 2-2" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
            Gerenciar preferências de cookies
          </DialogTitle>
          <DialogDescription>
            Escolha quais categorias de cookies você aceita. Suas preferências serão
            salvas localmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {(Object.keys(CATEGORY_INFO) as ConsentCategory[]).map((category) => {
            const info = CATEGORY_INFO[category]
            const isEssential = category === "essential"
            return (
              <div
                key={category}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{info.label}</span>
                    {isEssential && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        Sempre ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
                <Switch
                  id={`consent-${category}`}
                  checked={preferences[category]}
                  onCheckedChange={(val) => updatePreference(category, val)}
                  disabled={isEssential}
                />
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" size="sm" onClick={rejectAll} className="w-full sm:w-auto">
            Rejeitar tudo
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Salvar
            </Button>
            <Button size="sm" onClick={acceptAll} className="flex-1 sm:flex-none">
              Aceitar tudo
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main export — wraps provider + dialog
// ---------------------------------------------------------------------------

export type ConsentManagerProps = ConsentManagerProviderProps

function ConsentManager({ children, position }: ConsentManagerProps) {
  return (
    <ConsentManagerProvider position={position}>
      {children}
      <ConsentDialog />
    </ConsentManagerProvider>
  )
}

export { ConsentManager, ConsentManagerProvider }
