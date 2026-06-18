/**
 * DashboardPanel — card-shell de painel para dashboards.
 *
 * Container com borda/sombra padrão e um header de duas partes: à esquerda um
 * título e uma descrição opcional; à direita um slot de `action` (badge, botão,
 * select…). O conteúdo do painel vai em `children`, abaixo do header.
 *
 * Extraído da composição `saas-dashboard-pro`. Sem dependências novas, sem
 * estado. O elemento raiz é uma <section> com `data-slot="dashboard-panel"` e
 * aceita className/props padrão.
 *
 * A prop opcional `glow` é um ponto de extensão reservado para uma futura
 * variante com brilho (ex.: GlowingEffect usada na trilha de observability).
 * Por enquanto ela apenas marca o elemento (`data-glow`) — NÃO adiciona
 * dependências nem altera o visual — para manter compatibilidade quando a
 * variante for ligada.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface DashboardPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Título do painel (header). */
  title: string
  /** Descrição opcional, abaixo do título. */
  description?: string
  /** Slot de ação à direita do header (ex.: Badge, Button). */
  action?: React.ReactNode
  /** Conteúdo do painel. */
  children?: React.ReactNode
  /**
   * Reservado para a futura variante com brilho (GlowingEffect). Sem efeito
   * visual por enquanto: apenas marca o elemento com `data-glow`.
   */
  glow?: boolean
}

function DashboardPanel({
  title,
  description,
  action,
  glow = false,
  className,
  children,
  ...props
}: DashboardPanelProps) {
  return (
    <section
      data-slot="dashboard-panel"
      data-glow={glow ? "" : undefined}
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export { DashboardPanel }
