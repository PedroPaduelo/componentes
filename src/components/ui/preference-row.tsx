/**
 * PreferenceRow — linha de preferência para telas de configurações.
 *
 * Item de duas partes: à esquerda um título (`label`) e uma descrição opcional;
 * à direita um slot para o controle (Switch, Select, Button…). Pensada para
 * listas de preferências/toggles separadas por divisórias (ex.: um painel
 * "Preferências" com `divide-y divide-border`).
 *
 * Extraído da composição `saas-dashboard-pro`. SHARED — sem dependências novas,
 * sem estado: o controle (e o estado dele) vive fora. O elemento raiz expõe
 * `data-slot="preference-row"` e aceita className/props padrão de um <div>.
 *
 * O controle pode ser passado via `control` (slot dedicado) ou como `children`;
 * quando ambos existem, `control` tem prioridade.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface PreferenceRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Título da preferência (à esquerda). */
  label: string
  /** Descrição opcional, abaixo do título. */
  description?: string
  /** Controle à direita (ex.: Switch). Alternativa a `children`. */
  control?: React.ReactNode
  /** Controle/conteúdo à direita, quando não usar `control`. */
  children?: React.ReactNode
}

function PreferenceRow({
  label,
  description,
  control,
  className,
  children,
  ...props
}: PreferenceRowProps) {
  return (
    <div
      data-slot="preference-row"
      className={cn(
        "flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{control ?? children}</div>
    </div>
  )
}

export { PreferenceRow }
