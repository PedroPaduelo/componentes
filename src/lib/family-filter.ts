/**
 * Filtro de FAMÍLIAS — lógica pura compartilhada (sem UI).
 *
 * Extraído de `src/pages/Home.tsx` para ser reusado tanto pelo catálogo (Home)
 * quanto pela navegação de documentação (DocsSidebar). A regra de busca e os
 * filtros de origem/tag são idênticos em ambos os consumidores: manter aqui
 * evita duplicar e garante consistência.
 */

import type { Family, ComponentOrigin } from "@/data/families"

/** Texto pesquisável de uma família: base, nome, e slug/nome/tags de cada variant. */
export function familyHaystack(family: Family): string {
  const parts: string[] = [family.base, family.name, ...family.origins]
  for (const v of family.variants) {
    parts.push(v.slug, v.name, ...v.tags)
  }
  return parts.join(" ").toLowerCase()
}

/** Família casa a origem se a origem está presente em `family.origins`. */
export function familyMatchesOrigin(
  family: Family,
  origin: ComponentOrigin | null
): boolean {
  if (origin === null) return true
  return family.origins.includes(origin)
}

/** Família casa a tag se QUALQUER variant tem a tag selecionada. */
export function familyMatchesTag(family: Family, tag: string | null): boolean {
  if (tag === null) return true
  return family.variants.some((v) => v.tags.includes(tag))
}

/**
 * Filtro em memória: busca (case-insensitive) + origem + tag (AND).
 *
 * @param list    - famílias a filtrar.
 * @param query   - texto livre (case-insensitive).
 * @param origin  - origem selecionada ou null (todas).
 * @param tag     - tag selecionada ou null (todas).
 */
export function filterFamilies(
  list: Family[],
  query: string,
  origin: ComponentOrigin | null = null,
  tag: string | null = null
): Family[] {
  const q = query.trim().toLowerCase()
  return list.filter((family) => {
    if (!familyMatchesOrigin(family, origin)) return false
    if (!familyMatchesTag(family, tag)) return false
    if (!q) return true
    return familyHaystack(family).includes(q)
  })
}

/** "Todos" como origem — null representa ausência de filtro. */
export const ALL_ORIGINS: ComponentOrigin | null = null

/** "Todas" como tag — null representa ausência de filtro. */
export const ALL_TAGS: string | null = null

/**
 * Lista das 4 origens canônicas, na ordem de prioridade de exibição.
 */
export const ORIGIN_VALUES: ComponentOrigin[] = [
  "shadcn",
  "Fluid",
  "chanhdai",
  "@pierre/trees",
]

/**
 * Coleta todas as tags únicas das famílias e retorna as mais populares
 * (por contagem de famílias que as contêm), limitadas a `limit`.
 */
export function popularTags(list: Family[], limit = 8): string[] {
  const counts = new Map<string, number>()
  for (const family of list) {
    const seen = new Set<string>()
    for (const v of family.variants) {
      for (const t of v.tags) seen.add(t)
    }
    for (const t of seen) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag)
}