import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { groupByFamily, type ComponentOrigin } from "@/data/families"
import {
  filterFamilies,
  popularTags,
} from "@/lib/family-filter"
import { ComponentCard } from "@/components/catalog/ComponentCard"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  ALL_CATEGORIES,
  CategoryFilter,
  OriginFilter,
  TagFilter,
  type CategoryFilterValue,
} from "@/components/catalog/CategoryFilter"
import { EmptyState } from "@/components/catalog/EmptyState"

export function Home() {
  const [searchParams] = useSearchParams()

  // Lê query params do breadcrumb (ex.: ?category=Feedback, ?origin=Fluid).
  // Resolve a issue LOW cmqjn9aac: breadcrumb linka ?category= mas Home não lia.
  const paramCategory = searchParams.get("category")
  const paramOrigin = searchParams.get("origin")

  const validCategory = useMemo<CategoryFilterValue>(() => {
    if (
      paramCategory === "Actions" ||
      paramCategory === "Layout" ||
      paramCategory === "Forms" ||
      paramCategory === "Feedback"
    ) {
      return paramCategory
    }
    return ALL_CATEGORIES
  }, [paramCategory])

  const validOrigin = useMemo<ComponentOrigin | null>(() => {
    if (
      paramOrigin === "shadcn" ||
      paramOrigin === "Fluid" ||
      paramOrigin === "chanhdai" ||
      paramOrigin === "@pierre/trees"
    ) {
      return paramOrigin
    }
    return null
  }, [paramOrigin])

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilterValue>(validCategory)
  const [origin, setOrigin] = useState<ComponentOrigin | null>(validOrigin)
  const [tag, setTag] = useState<string | null>(null)

  // Sincroniza quando o breadcrumb muda o query param (ex.: user clica num
  // link de categoria fora da Home e volta).
  useEffect(() => {
    setCategory(validCategory)
  }, [validCategory])

  useEffect(() => {
    setOrigin(validOrigin)
  }, [validOrigin])

  const families = useMemo(() => groupByFamily(), [])

  const topTags = useMemo(() => popularTags(families, 8), [families])

  const filtered = useMemo(
    () => filterFamilies(families, query, category, origin, tag),
    [families, query, category, origin, tag]
  )

  // Contagens por categoria respeitando a busca/origem/tag atuais (mas não a categoria selecionada).
  const categoryCounts = useMemo(() => {
    const base = filterFamilies(families, query, ALL_CATEGORIES, origin, tag)
    const map: Record<string, number> = { [ALL_CATEGORIES]: base.length }
    for (const family of base) {
      const cats = new Set(family.variants.map((v) => v.category))
      for (const c of cats) {
        map[c] = (map[c] ?? 0) + 1
      }
    }
    return map
  }, [families, query, origin, tag])

  // Contagens por origem respeitando busca/categoria/tag (mas não a origem selecionada).
  const originCounts = useMemo(() => {
    const base = filterFamilies(families, query, category, null, tag)
    const map: Record<string, number> = {}
    for (const family of base) {
      for (const o of family.origins) {
        map[o] = (map[o] ?? 0) + 1
      }
    }
    return map
  }, [families, query, category, tag])

  // Contagens por tag respeitando busca/categoria/origem (mas não a tag selecionada).
  const tagCounts = useMemo(() => {
    const base = filterFamilies(families, query, category, origin, null)
    const map: Record<string, number> = {}
    for (const family of base) {
      const seen = new Set<string>()
      for (const v of family.variants) {
        for (const t of v.tags) seen.add(t)
      }
      for (const t of seen) {
        map[t] = (map[t] ?? 0) + 1
      }
    }
    return map
  }, [families, query, category, origin])

  const hasActiveFilters =
    query !== "" ||
    category !== ALL_CATEGORIES ||
    origin !== null ||
    tag !== null

  function resetFilters() {
    setQuery("")
    setCategory(ALL_CATEGORIES)
    setOrigin(null)
    setTag(null)
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
          e filtre por categoria, origem ou tag.
        </p>
      </section>

      {/* Controles: busca + filtros */}
      <section className="mx-auto mt-10 max-w-3xl space-y-4">
        <SearchInput value={query} onChange={setQuery} />

        <div className="flex flex-wrap items-center gap-2">
          <CategoryFilter
            value={category}
            onChange={setCategory}
            counts={categoryCounts}
          />
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>

        <OriginFilter
          value={origin}
          onChange={setOrigin}
          counts={originCounts}
        />

        <TagFilter
          tags={topTags}
          value={tag}
          onChange={setTag}
          counts={tagCounts}
        />
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
