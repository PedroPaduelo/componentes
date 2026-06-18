import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Um nível da trilha: rótulo exibido + destino opcional. */
export interface DocBreadcrumbSegment {
  /** Rótulo humano exibido no segmento — ex.: "Componentes", "Forms". */
  label: string
  /**
   * Rota (react-router) do destino. Omitido = segmento sem link. Por convenção
   * o ÚLTIMO segmento (página atual) não tem `href`.
   */
  href?: string
}

export interface DocBreadcrumbProps {
  /**
   * Sequência de segmentos, do mais geral ao mais específico. O último é a
   * página atual: renderiza sem link e com `aria-current="page"`.
   */
  segments: DocBreadcrumbSegment[]
  className?: string
}

/**
 * Trilha de navegação ("breadcrumb") para o topo de páginas de documentação.
 *
 * Componente GENÉRICO e reusável: recebe apenas uma lista de `segments`
 * `{ label, href? }` e não conhece nada de famílias, grupos ou composições —
 * quem chama monta a trilha. Por isso serve igualmente à página de família,
 * à futura group-page e a outras telas de doc.
 *
 * Regras de render:
 *  - Segmentos intermediários com `href` viram `<Link>`.
 *  - O último segmento (página atual) é sempre renderizado como texto, sem
 *    link, com `aria-current="page"` — mesmo que receba `href`.
 *  - Separador `ChevronRight` decorativo (`aria-hidden`) entre os segmentos.
 *
 * Acessibilidade: `<nav aria-label="Trilha de navegação">` + `aria-current`
 * no item atual.
 */
export function DocBreadcrumb({ segments, className }: DocBreadcrumbProps) {
  if (segments.length === 0) return null

  const lastIndex = segments.length - 1

  return (
    <nav
      aria-label="Trilha de navegação"
      data-slot="doc-breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {segments.map((segment, index) => {
        const isLast = index === lastIndex
        const isLink = !isLast && Boolean(segment.href)

        return (
          <Fragment key={`${index}-${segment.label}`}>
            {isLink ? (
              <Link
                to={segment.href!}
                className="transition-colors hover:text-foreground"
              >
                {segment.label}
              </Link>
            ) : (
              <span
                className={cn(isLast && "font-medium text-foreground")}
                aria-current={isLast ? "page" : undefined}
              >
                {segment.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRight
                className="size-3.5 shrink-0 opacity-60"
                aria-hidden
              />
            ) : null}
          </Fragment>
        )
      })}
    </nav>
  )
}
