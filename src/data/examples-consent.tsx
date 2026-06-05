import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Demo isolada do Consent Manager para o preview da vitrine.
 *
 * O componente real (`ConsentManager`) renderiza um botão flutuante
 * `fixed` na tela inteira + persiste no localStorage — comportamento que
 * não cabe num preview embutido. Aqui replicamos o DIÁLOGO de preferências
 * com estado local efêmero, para o usuário ver a UI sem efeitos colaterais
 * globais. A API de produção está documentada no snippet de código.
 */

type Category = "essential" | "analytics" | "marketing"

const CATEGORY_INFO: Record<Category, { label: string; description: string }> = {
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

function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 " +
        (checked ? "bg-primary" : "bg-input")
      }
    >
      <span
        className={
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform " +
          (checked ? "translate-x-5" : "translate-x-0")
        }
      />
    </button>
  )
}

export function ConsentDemoTrigger() {
  const [open, setOpen] = React.useState(false)
  const [prefs, setPrefs] = React.useState<Record<Category, boolean>>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Gerenciar cookies
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar preferências de cookies</DialogTitle>
            <DialogDescription>
              Escolha quais categorias de cookies você aceita. (Demo — sem
              persistência.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(Object.keys(CATEGORY_INFO) as Category[]).map((category) => {
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
                    <p className="text-xs text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                  <Switch
                    id={`consent-demo-${category}`}
                    checked={prefs[category]}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({ ...p, [category]: v }))
                    }
                    disabled={isEssential}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPrefs({ essential: true, analytics: false, marketing: false })
              }
              className="w-full sm:w-auto"
            >
              Rejeitar tudo
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPrefs({ essential: true, analytics: true, marketing: true })
                setOpen(false)
              }}
              className="w-full sm:w-auto"
            >
              Aceitar tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
