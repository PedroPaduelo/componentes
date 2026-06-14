import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { compositions } from "@/data/compositions"
import {
  filterCompositions,
  groupCompositionsByCategory,
  UNCATEGORIZED,
  type CompositionGroup,
} from "@/lib/composition-filter"
import { SearchInput } from "@/components/catalog/SearchInput"
import { getCompositionCategoryIcon } from "@/components/layout/composition-category-icons"
import { useCompositionsCollapsedGroups } from "@/components/layout/use-compositions-collapsed-groups"
import { cn } from "@/lib/utils"

/** Categoria da composição da rota ativa (`/compositions/<slug>`), ou null. */
function findActiveCategory(
  groups: CompositionGroup[],
  pathname: string,
): string | null {
  const decoded = decodeURIComponent(pathname)
  for (const group of groups) {
    for (const composition of group.compositions) {
      if (`/compositions/${composition.slug}` === decoded) return group.category
    }
  }
  return null
}

type CompositionsSidebarNavProps = {
  /** Chamado ao clicar num item — usado pelo drawer mobile para fechar. */
  onNavigate?: () => void
}

/**
 * Conteúdo da navegação de composições: busca no topo + composições agrupadas
 * por categoria em GRUPOS COLAPSÁVEIS (espelha o DocsSidebar de componentes).
 * Cada grupo tem cabeçalho clicável (ícone + título + contagem + chevron) e
 * itens indentados sob um rail vertical. Reutilizado tanto na sidebar fixa
 * (desktop) quanto no drawer (mobile).
 */
export function CompositionsSidebarNav({
  onNavigate,
}: CompositionsSidebarNavProps) {
  const [query, setQuery] = useState("")
  const location = useLocation()

  const filtered = useMemo(
    () => filterCompositions(compositions, query),
    [query],
  )
  const groups = useMemo(
    () => groupCompositionsByCategory(filtered),
    [filtered],
  )

  // Para o auto-expand precisamos da categoria do ativo no conjunto COMPLETO
  // (não no filtrado), senão durante a busca o ativo "some" e o grupo fecharia.
  const fullGroups = useMemo(
    () => groupCompositionsByCategory(compositions),
    [],
  )
  const activeCategory = findActiveCategory(fullGroups, location.pathname)

  const searchActive = query.trim().length > 0
  const { toggle, isExpanded } = useCompositionsCollapsedGroups(activeCategory)

  return (
    <div className="flex h-full flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Filtrar composições..."
      />

      <nav
        aria-label="Navegação de composições"
        className="flex-1 space-y-1 overflow-y-auto pb-8"
      >
        {groups.length > 0 ? (
          groups.map((group) => {
            const Icon = getCompositionCategoryIcon(group.category)
            const expanded = isExpanded(group.category, searchActive)
            const slug =
              group.category === UNCATEGORIZED
                ? "outras"
                : group.category.toLowerCase().replace(/\s+/g, "-")
            const panelId = `compositions-group-${slug}`
            return (
              <div key={group.category}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggle(group.category)}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-left">{group.category}</span>
                  <span className="text-[10px] font-normal tabular-nums text-muted-foreground/70">
                    {group.compositions.length}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      expanded && "rotate-90",
                    )}
                  />
                </button>

                {expanded && (
                  <ul
                    id={panelId}
                    className="ml-3.5 mt-1 space-y-0.5 border-l border-border pl-3"
                  >
                    {group.compositions.map((composition) => {
                      const to = `/compositions/${composition.slug}`
                      const isActive =
                        decodeURIComponent(location.pathname) === to
                      return (
                        <li key={composition.slug}>
                          <Link
                            to={to}
                            aria-current={isActive ? "page" : undefined}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                              isActive &&
                                "bg-accent font-medium text-foreground",
                            )}
                          >
                            <span className="flex-1 truncate">
                              {composition.name}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            Nenhuma composição encontrada.
          </p>
        )}
      </nav>
    </div>
  )
}

/**
 * Sidebar fixa de composições (desktop ≥ lg). Sticky, ocupa a altura da
 * viewport menos o header (h-16 = 4rem), com scroll independente.
 */
export function CompositionsSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden px-4 py-6">
        <CompositionsSidebarNav />
      </div>
    </aside>
  )
}
