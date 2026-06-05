import { useMemo, useState } from "react"

import { components, type ComponentMeta } from "@/data/components"
import { ComponentCard } from "@/components/catalog/ComponentCard"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  ALL_CATEGORIES,
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/catalog/CategoryFilter"
import { EmptyState } from "@/components/catalog/EmptyState"

/** Filtro em memória: busca por nome/tags (case-insensitive) + categoria (AND). */
function filterComponents(
  list: ComponentMeta[],
  query: string,
  category: CategoryFilterValue
): ComponentMeta[] {
  const q = query.trim().toLowerCase()
  return list.filter((c) => {
    const matchesCategory =
      category === ALL_CATEGORIES || c.category === category
    if (!matchesCategory) return false
    if (!q) return true
    const haystack = [c.name, ...c.tags].join(" ").toLowerCase()
    return haystack.includes(q)
  })
}

export function Home() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilterValue>(ALL_CATEGORIES)

  const filtered = useMemo(
    () => filterComponents(components, query, category),
    [query, category]
  )

  // Contagens por categoria respeitando a busca atual (mas não a categoria selecionada).
  const counts = useMemo(() => {
    const bySearch = filterComponents(components, query, ALL_CATEGORIES)
    const map: Record<string, number> = { [ALL_CATEGORIES]: bySearch.length }
    for (const c of bySearch) {
      map[c.category] = (map[c.category] ?? 0) + 1
    }
    return map
  }, [query])

  function resetFilters() {
    setQuery("")
    setCategory(ALL_CATEGORIES)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Hero curto */}
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Vitrine UI
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Catálogo de componentes
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Explore componentes React open-source baseados em shadcn/ui. Busque
          por nome e filtre por categoria.
        </p>
      </section>

      {/* Controles: busca + filtro */}
      <section className="mx-auto mt-10 max-w-3xl space-y-4">
        <SearchInput value={query} onChange={setQuery} />
        <div className="flex justify-center sm:justify-start">
          <CategoryFilter
            value={category}
            onChange={setCategory}
            counts={counts}
          />
        </div>
      </section>

      {/* Grid de cards / empty state */}
      <section className="mt-10">
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1 ? "componente" : "componentes"}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((component) => (
              <ComponentCard key={component.slug} component={component} />
            ))
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </div>
      </section>
    </div>
  )
}
