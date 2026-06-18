import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { familyHaystack } from "@/lib/family-filter"
import {
  DOMAIN_IDS,
  GROUP_BY_ID,
  getGroupItems,
  listGroups,
  type DomainId,
  type GroupId,
  type GroupWithCount,
} from "@/data/groups"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  DOMAIN_ICONS,
  DOMAIN_LABELS,
  GROUP_ICONS,
} from "@/components/layout/category-icons"
import { useCollapsedGroups } from "@/components/layout/use-collapsed-groups"
import { cn } from "@/lib/utils"

/**
 * Um grupo anotado para a navegação: o grupo (com contagens derivadas) + o
 * texto pesquisável (label + descrição + famílias) e os `base`s das famílias
 * que ele contém (para resolver o grupo ativo quando se está numa família).
 */
type GroupEntry = {
  group: GroupWithCount
  bases: string[]
  haystack: string
}

/** Uma seção da sidebar: um domínio macro + os grupos que pertencem a ele. */
type DomainSection = {
  domain: DomainId
  groups: GroupWithCount[]
}

/**
 * Monta a tabela de grupos da navegação a partir de `listGroups` (9 grupos já
 * ordenados, com `componentCount`/`familyCount`). Para cada grupo deriva, do
 * registry (read-only), o texto pesquisável e os `base`s das suas famílias.
 */
function buildGroupEntries(): GroupEntry[] {
  return listGroups().map((group) => {
    const items = getGroupItems(group.id)
    const bases = items.map((f) => f.base)
    const haystack = [group.label, group.description, ...items.map(familyHaystack)]
      .join(" ")
      .toLowerCase()
    return { group, bases, haystack }
  })
}

/**
 * Filtra os grupos pela busca: um grupo permanece se a query casar seu rótulo,
 * sua descrição ou QUALQUER família contida (haystack). Query vazia → todos.
 */
function filterEntries(entries: GroupEntry[], query: string): GroupWithCount[] {
  const q = query.trim().toLowerCase()
  return entries
    .filter((e) => (q ? e.haystack.includes(q) : true))
    .map((e) => e.group)
}

/**
 * Particiona os grupos filtrados nos 3 domínios macro, na ordem de `DOMAIN_IDS`
 * (primitivos → aplicações → visual). Domínios sem grupos são omitidos.
 */
function groupByDomain(groups: GroupWithCount[]): DomainSection[] {
  return DOMAIN_IDS.map((domain) => ({
    domain,
    groups: groups.filter((g) => g.domain === domain),
  })).filter((s) => s.groups.length > 0)
}

/** Type guard: o param da rota é um `GroupId` conhecido? */
function isGroupId(value: string): value is GroupId {
  return Object.prototype.hasOwnProperty.call(GROUP_BY_ID, value)
}

/**
 * Resolve o GRUPO ativo a partir do pathname:
 *  - `/components/grupo/<id>` → o próprio grupo (se `<id>` for válido);
 *  - `/components/<base>` (página de família) → o grupo que contém aquela
 *    família (best-effort: primeira correspondência por `base`).
 * Outras rotas → null (nada destacado).
 */
function findActiveGroup(pathname: string, entries: GroupEntry[]): GroupId | null {
  const decoded = decodeURIComponent(pathname)
  const grupo = decoded.match(/^\/components\/grupo\/([^/]+)$/)
  if (grupo) return isGroupId(grupo[1]) ? grupo[1] : null
  const family = decoded.match(/^\/components\/([^/]+)$/)
  if (family) {
    const base = family[1]
    const entry = entries.find((e) => e.bases.includes(base))
    return entry ? entry.group.id : null
  }
  return null
}

type DocsSidebarNavProps = {
  /** Chamado ao clicar num item — usado pelo drawer mobile para fechar. */
  onNavigate?: () => void
}

/**
 * Conteúdo da navegação de docs: busca no topo + os 9 GRUPOS (clusters da
 * ONDA 2) agrupados pelos 3 DOMÍNIOS macro em seções COLAPSÁVEIS (estilo
 * Aceternity docs). Cada domínio tem cabeçalho clicável (ícone + título +
 * chevron) e, sob um rail vertical, os grupos do domínio — cada um é um LINK
 * para `/components/grupo/:groupId` com ícone + contagem de componentes.
 * Reutilizado tanto na sidebar fixa (desktop) quanto no drawer (mobile).
 */
export function DocsSidebarNav({ onNavigate }: DocsSidebarNavProps) {
  const [query, setQuery] = useState("")
  const location = useLocation()

  const entries = useMemo(() => buildGroupEntries(), [])
  const filtered = useMemo(() => filterEntries(entries, query), [entries, query])
  const sections = useMemo(() => groupByDomain(filtered), [filtered])

  // Grupo/domínio ativos: derivados do conjunto COMPLETO (não do filtrado),
  // senão durante a busca o ativo "some" e o domínio fecharia.
  const activeGroup = findActiveGroup(location.pathname, entries)
  const activeDomain = activeGroup ? GROUP_BY_ID[activeGroup].domain : null

  const searchActive = query.trim().length > 0
  const { toggle, isExpanded } = useCollapsedGroups(activeDomain)

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
        {sections.length > 0 ? (
          sections.map((section) => {
            const DomainIcon = DOMAIN_ICONS[section.domain]
            const expanded = isExpanded(section.domain, searchActive)
            const panelId = `docs-domain-${section.domain}`
            return (
              <div key={section.domain}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggle(section.domain)}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <DomainIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-left">
                    {DOMAIN_LABELS[section.domain]}
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
                    {section.groups.map((group) => {
                      const Icon = GROUP_ICONS[group.id]
                      const to = `/components/grupo/${group.id}`
                      const isActive = group.id === activeGroup
                      return (
                        <li key={group.id}>
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
                            <Icon
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="flex-1 truncate">{group.label}</span>
                            <span className="text-[10px] font-normal tabular-nums text-muted-foreground/70">
                              {group.componentCount}
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
