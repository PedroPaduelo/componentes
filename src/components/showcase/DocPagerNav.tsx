import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Destino de um dos lados do pager: para onde ir + rótulo exibido. */
export interface DocPagerLink {
  /** Rota (react-router) do destino — ex.: `/components/button`. */
  href: string
  /** Rótulo humano exibido no card — ex.: nome da família/página. */
  label: string
}

export interface DocPagerNavProps {
  /** Destino "Anterior" (lado esquerdo). Omitido na primeira página. */
  prev?: DocPagerLink
  /** Destino "Próxima" (lado direito). Omitido na última página. */
  next?: DocPagerLink
  className?: string
}

/**
 * Navegação "Anterior / Próxima" para o rodapé de páginas de documentação.
 *
 * Componente GENÉRICO e reusável: recebe apenas `prev`/`next` como
 * `{ href, label }` e não conhece nada de famílias, composições ou grupos —
 * quem chama é responsável por mapear sua sequência para esses links. Por isso
 * serve igualmente à página de família, à futura group-page e às composições.
 *
 * Layout: grid de 2 colunas. O card "Anterior" fica sempre na coluna esquerda
 * e o "Próxima" sempre na direita (`col-start-2`), então quando um dos lados
 * falta o outro permanece ancorado no seu lado — **sem layout shift**. O lado
 * ausente simplesmente não é renderizado (sem placeholder visível).
 *
 * Acessibilidade: cada card é um `Link` com `aria-label` ("Anterior" /
 * "Próxima") e os ícones são decorativos (`aria-hidden`). Se ambos os lados
 * faltarem, nada é renderizado.
 */
export function DocPagerNav({ prev, next, className }: DocPagerNavProps) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Navegação entre páginas"
      data-slot="doc-pager-nav"
      className={cn(
        "mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8",
        className,
      )}
    >
      {prev ? (
        <Link
          to={prev.href}
          aria-label="Anterior"
          className="group col-start-1 flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-foreground/20 hover:bg-accent"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            Anterior
          </span>
          <span className="line-clamp-1 text-sm font-medium text-foreground">
            {prev.label}
          </span>
        </Link>
      ) : null}

      {next ? (
        <Link
          to={next.href}
          aria-label="Próxima"
          className="group col-start-2 flex flex-col items-end gap-1 rounded-lg border border-border bg-card px-4 py-3 text-right transition-colors hover:border-foreground/20 hover:bg-accent"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Próxima
            <ChevronRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
          <span className="line-clamp-1 text-sm font-medium text-foreground">
            {next.label}
          </span>
        </Link>
      ) : null}
    </nav>
  )
}
