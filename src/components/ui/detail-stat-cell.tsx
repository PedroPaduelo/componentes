/**
 * DetailStatCell — célula de "rótulo + valor" para grades de detalhe.
 *
 * Mostra um rótulo discreto no topo (com ícone opcional) e o valor/conteúdo
 * logo abaixo, dentro de um bloco com borda suave. Pensada para grids de
 * detalhe (ex.: cartão/diálogo de um cliente, fatura ou recurso), onde várias
 * células compõem um resumo em duas colunas.
 *
 * Extraído da composição `saas-dashboard-pro`. Sem dependências novas, sem
 * estado. O elemento raiz expõe `data-slot="detail-stat-cell"` e aceita
 * className/props padrão de um <div>.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface DetailStatCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Rótulo da célula (ex.: "Plano", "Status"). */
  label: string
  /** Ícone opcional exibido antes do rótulo. */
  icon?: React.ComponentType<{ className?: string }>
  /** Valor/conteúdo exibido abaixo do rótulo. */
  children?: React.ReactNode
}

function DetailStatCell({
  label,
  icon: Icon,
  className,
  children,
  ...props
}: DetailStatCellProps) {
  return (
    <div
      data-slot="detail-stat-cell"
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

export { DetailStatCell }
