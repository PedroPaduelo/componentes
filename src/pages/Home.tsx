import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { groupByFamily, type ComponentOrigin } from "@/data/families"
import {
  filterFamilies,
  popularTags,
} from "@/lib/family-filter"
import { getGroup, GROUPS } from "@/data/groups"
import { ComponentCard } from "@/components/catalog/ComponentCard"
import { SearchInput } from "@/components/catalog/SearchInput"
import {
  OriginFilter,
  TagFilter,
} from "@/components/catalog/CategoryFilter"
import {
  ALL_GROUPS,
  GroupFilter,
  type GroupFilterValue,
} from "@/components/catalog/GroupFilter"
import { EmptyState } from "@/components/catalog/EmptyState"

/**
 * Catálogo flat (`/`): busca + facetas. A faceta de "tipo de componente" é
 * UMA SÓ — o GRUPO (mesma taxonomia de `/components`) — evitando a duplicação
 * antiga (Categoria × Grupo) que confundia humano e IA. `Origin` (de onde vem)
 * e `Tag` (palavra-chave livre) são facetas ORTOGONAIS e permanecem. A
 * `category` segue como metadado/badge no card, só não é mais um filtro.
 */
export function Home() {
  const [searchParams] = useSearchParams()

  // Lê ?origin= do breadcrumb (ex.: ?origin=Fluid).
  const paramOrigin = searchParams.get("origin")

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
  const [origin, setOrigin] = useState<ComponentOrigin | null>(validOrigin)
  const [tag, setTag] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupFilterValue>(ALL_GROUPS)

  useEffect(() => {
    setOrigin(validOrigin)
  }, [validOrigin])

  const families = useMemo(() => groupByFamily(), [])

  const topTags = useMemo(() => popularTags(families, 8), [families])

  // Filtro por grupo é LOCAL da Home (não compartilhado via family-filter.ts)
  // — não toca na lógica pura compartilhada com a sidebar/overview.
  const groupFiltered = useMemo(() => {
    if (group === ALL_GROUPS) return families
    return families.filter((f) =>
      f.variants.some((v) => getGroup(v.slug) === group),
    )
  }, [families, group])

  const filtered = useMemo(
    () => filterFamilies(groupFiltered, query, origin, tag),
    [groupFiltered, query, origin, tag],
  )

  // Contagens por origem respeitando busca/tag (mas não a origem selecionada).
  const originCounts = useMemo(() => {
    const base = filterFamilies(families, query, null, tag)
    const map: Record<string, number> = {}
    for (const family of base) {
      for (const o of family.origins) {
        map[o] = (map[o] ?? 0) + 1
      }
    }
    return map
  }, [families, query, tag])

  // Contagens por tag respeitando busca/origem (mas não a tag selecionada).
  const tagCounts = useMemo(() => {
    const base = filterFamilies(families, query, origin, null)
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
  }, [families, query, origin])

  // Opções de grupo já ordenadas por `order` (primitivos → aplicações → visual),
  // com a contagem de famílias atualizada pela busca/origem/tag selecionados
  // — sem considerar o próprio filtro de grupo.
  const groupOptions = useMemo(() => {
    const base = filterFamilies(families, query, origin, tag)
    return GROUPS.map((g) => {
      const count = base.filter((f) =>
        f.variants.some((v) => getGroup(v.slug) === g.id),
      ).length
      return { id: g.id, label: g.label, count }
    })
  }, [families, query, origin, tag])

  const groupTotalCount = useMemo(() => {
    return filterFamilies(families, query, origin, tag).length
  }, [families, query, origin, tag])

  const hasActiveFilters =
    query !== "" || origin !== null || tag !== null || group !== ALL_GROUPS

  function resetFilters() {
    setQuery("")
    setOrigin(null)
    setTag(null)
    setGroup(ALL_GROUPS)
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
          e filtre por grupo, origem ou tag.
        </p>
      </section>

      {/* Controles: busca + filtros */}
      <section className="mx-auto mt-10 max-w-3xl space-y-4">
        <SearchInput value={query} onChange={setQuery} />

        <GroupFilter
          value={group}
          onChange={setGroup}
          options={groupOptions}
          totalCount={groupTotalCount}
        />

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

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
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
