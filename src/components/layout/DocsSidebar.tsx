import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { CATEGORIES, type Category } from "@/data/components"
import { groupByFamily, type Family } from "@/data/families"
import { filterFamilies } from "@/lib/family-filter"
import { SearchInput } from "@/components/catalog/SearchInput"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_ICONS } from "@/components/layout/category-icons"
import { useCollapsedGroups } from "@/components/layout/use-collapsed-groups"
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

/**
 * Família "recente" = pertence a um lote novo (Aceternity / VengenceUI),
 * derivado por TAGS das variantes (a origem `getOrigin` não distingue esses
 * lotes — caem como shadcn). Recebe o badge "New" discreto na sidebar.
 */
function isRecentFamily(family: Family): boolean {
  return family.variants.some(
    (v) => v.tags.includes("aceternity") || v.tags.includes("vengenceui"),
  )
}

/** Categoria da rota ativa (`/components/<base>`), ou null se não houver. */
function findActiveCategory(groups: CategoryGroup[], pathname: string): Category | null {
  const decoded = decodeURIComponent(pathname)
  for (const group of groups) {
    for (const family of group.families) {
      if (`/components/${family.base}` === decoded) return group.category
    }
  }
  return null
}

type DocsSidebarNavProps = {
  /** Chamado ao clicar num item — usado pelo drawer mobile para fechar. */
  onNavigate?: () => void
}

/**
 * Conteúdo da navegação de docs: busca no topo + famílias agrupadas por
 * categoria em GRUPOS COLAPSÁVEIS (estilo Aceternity docs). Cada grupo tem
 * cabeçalho clicável (ícone + título + contagem + chevron) e itens indentados
 * sob um rail vertical. Reutilizado tanto na sidebar fixa (desktop) quanto no
 * drawer (mobile) — a hierarquia propaga para ambos.
 */
export function DocsSidebarNav({ onNavigate }: DocsSidebarNavProps) {
  const [query, setQuery] = useState("")
  const location = useLocation()

  const families = useMemo(() => groupByFamily(), [])
  const filtered = useMemo(() => filterFamilies(families, query), [families, query])
  const groups = useMemo(() => groupByCategory(filtered), [filtered])

  // Para o auto-expand precisamos da categoria do ativo no conjunto COMPLETO
  // (não no filtrado), senão durante a busca o ativo "some" e o grupo fecharia.
  const fullGroups = useMemo(() => groupByCategory(families), [families])
  const activeCategory = findActiveCategory(fullGroups, location.pathname)

  const searchActive = query.trim().length > 0
  const { toggle, isExpanded } = useCollapsedGroups(activeCategory)

  return (
    <div className="flex h-full flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Filtrar componentes..."
      />

      <nav
        aria-label="Navegação de componentes"
        className="flex-1 space-y-1 overflow-y-auto pb-8"
      >
        {groups.length > 0 ? (
          groups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category]
            const expanded = isExpanded(group.category, searchActive)
            const panelId = `docs-group-${group.category.toLowerCase()}`
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
                    {group.families.length}
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
                              "flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                              isActive &&
                                "bg-accent font-medium text-foreground",
                            )}
                          >
                            <span className="flex-1 truncate">{family.name}</span>
                            {isRecentFamily(family) && (
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-medium"
                              >
                                New
                              </Badge>
                            )}
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
