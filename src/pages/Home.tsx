import { useMemo, useState } from "react"

import { groupByFamily, type Family } from "@/data/families"
import { ComponentCard } from "@/components/catalog/ComponentCard"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  ALL_CATEGORIES,
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/catalog/CategoryFilter"
import { EmptyState } from "@/components/catalog/EmptyState"

/** Texto pesquisável de uma família: base, nome, e slug/nome/tags de cada variant. */
function familyHaystack(family: Family): string {
  const parts: string[] = [family.base, family.name, ...family.origins]
  for (const v of family.variants) {
    parts.push(v.slug, v.name, ...v.tags)
  }
  return parts.join(" ").toLowerCase()
}

/** Família casa a categoria se QUALQUER variant tem a categoria selecionada. */
function familyMatchesCategory(
  family: Family,
  category: CategoryFilterValue
): boolean {
  if (category === ALL_CATEGORIES) return true
  return family.variants.some((v) => v.category === category)
}

/** Filtro em memória: busca (case-insensitive) + categoria (AND). */
function filterFamilies(
  list: Family[],
  query: string,
  category: CategoryFilterValue
): Family[] {
  const q = query.trim().toLowerCase()
  return list.filter((family) => {
    if (!familyMatchesCategory(family, category)) return false
    if (!q) return true
    return familyHaystack(family).includes(q)
  })
}

export function Home() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilterValue>(ALL_CATEGORIES)

  const families = useMemo(() => groupByFamily(), [])

  const filtered = useMemo(
    () => filterFamilies(families, query, category),
    [families, query, category]
  )

  // Contagens por categoria respeitando a busca atual (mas não a categoria selecionada).
  const counts = useMemo(() => {
    const bySearch = filterFamilies(families, query, ALL_CATEGORIES)
    const map: Record<string, number> = { [ALL_CATEGORIES]: bySearch.length }
    for (const family of bySearch) {
      // Conta a família em cada categoria que alguma variant tenha.
      const cats = new Set(family.variants.map((v) => v.category))
      for (const c of cats) {
        map[c] = (map[c] ?? 0) + 1
      }
    }
    return map
  }, [families, query])

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
          Explore componentes React open-source agrupados por família. Cada
          família reúne as variantes de diferentes bibliotecas. Busque por nome
          e filtre por categoria.
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
          {filtered.length === 1 ? "família" : "famílias"}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((family) => (
              <ComponentCard key={family.base} family={family} />
            ))
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </div>
      </section>
    </div>
  )
}
