/**
 * Filtro de FAMÍLIAS — lógica pura compartilhada (sem UI).
 *
 * Extraído de `src/pages/Home.tsx` para ser reusado tanto pelo catálogo (Home)
 * quanto pela navegação de documentação (DocsSidebar). A regra de busca e a de
 * categoria são idênticas em ambos os consumidores: manter aqui evita duplicar
 * e garante consistência.
 */

import type { Family } from "@/data/families"
import {
  ALL_CATEGORIES,
  type CategoryFilterValue,
} from "@/components/catalog/CategoryFilter"

/** Texto pesquisável de uma família: base, nome, e slug/nome/tags de cada variant. */
export function familyHaystack(family: Family): string {
  const parts: string[] = [family.base, family.name, ...family.origins]
  for (const v of family.variants) {
    parts.push(v.slug, v.name, ...v.tags)
  }
  return parts.join(" ").toLowerCase()
}

/** Família casa a categoria se QUALQUER variant tem a categoria selecionada. */
export function familyMatchesCategory(
  family: Family,
  category: CategoryFilterValue
): boolean {
  if (category === ALL_CATEGORIES) return true
  return family.variants.some((v) => v.category === category)
}

/** Filtro em memória: busca (case-insensitive) + categoria (AND). */
export function filterFamilies(
  list: Family[],
  query: string,
  category: CategoryFilterValue = ALL_CATEGORIES
): Family[] {
  const q = query.trim().toLowerCase()
  return list.filter((family) => {
    if (!familyMatchesCategory(family, category)) return false
    if (!q) return true
    return familyHaystack(family).includes(q)
  })
}
