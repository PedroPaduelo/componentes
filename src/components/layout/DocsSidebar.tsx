import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { CATEGORIES, type Category } from "@/data/components"
import { groupByFamily, type Family } from "@/data/families"
import { filterFamilies } from "@/lib/family-filter"
import { SearchInput } from "@/components/catalog/SearchInput"
import { cn } from "@/lib/utils"

/** Um grupo da navegação: uma categoria + as famílias que pertencem a ela. */
type CategoryGroup = {
  category: Category
  families: Family[]
}

/**
 * Particiona as famílias filtradas nas 4 categorias canônicas, na ordem de
 * CATEGORIES. Uma família entra na categoria da sua variante representativa
 * (campo `category` de `Family`). Grupos vazios são omitidos.
 */
function groupByCategory(families: Family[]): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    families: families.filter((f) => f.category === category),
  })).filter((g) => g.families.length > 0)
}

type DocsSidebarNavProps = {
  /** Chamado ao clicar num item — usado pelo drawer mobile para fechar. */
  onNavigate?: () => void
}

/**
 * Conteúdo da navegação de docs: busca no topo + famílias agrupadas por
 * categoria. Reutilizado tanto na sidebar fixa (desktop) quanto no drawer
 * (mobile). Sem layout de coluna — quem o usa decide o container/scroll.
 */
export function DocsSidebarNav({ onNavigate }: DocsSidebarNavProps) {
  const [query, setQuery] = useState("")
  const location = useLocation()

  const families = useMemo(() => groupByFamily(), [])
  const filtered = useMemo(() => filterFamilies(families, query), [families, query])
  const groups = useMemo(() => groupByCategory(filtered), [filtered])

  return (
    <div className="flex h-full flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Filtrar componentes..."
      />

      <nav
        aria-label="Navegação de componentes"
        className="flex-1 space-y-6 overflow-y-auto pb-8"
      >
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.category}>
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h3>
              <ul className="space-y-0.5">
                {group.families.map((family) => {
                  const to = `/components/${family.base}`
                  const isActive =
                    decodeURIComponent(location.pathname) === to
                  return (
                    <li key={family.base}>
                      <Link
                        to={to}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                          isActive &&
                            "bg-accent font-medium text-foreground"
                        )}
                      >
                        {family.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            Nenhum componente encontrado.
          </p>
        )}
      </nav>
    </div>
  )
}

/**
 * Sidebar fixa de documentação (desktop ≥ lg). Sticky, ocupa a altura da
 * viewport menos o header (h-16 = 4rem), com scroll independente.
 */
export function DocsSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden px-4 py-6">
        <DocsSidebarNav />
      </div>
    </aside>
  )
}
