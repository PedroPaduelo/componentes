/**
 * Filtro e agrupamento de COMPOSIÇÕES — lógica pura (sem UI).
 *
 * Análogo a `family-filter.ts`, mas específico para `Composition`. Usado pela
 * navegação lateral de `/compositions` (CompositionsSidebar). A busca casa por
 * `name` / `description` / `tags` (e slug), case-insensitive; o agrupamento
 * deriva as categorias dos próprios dados (não há union hardcoded), com uma
 * ordem conhecida (Marketing → Aplicação → Showcase) e fallback por ordem de
 * primeira aparição para qualquer categoria nova.
 */

import { type Composition } from "@/data/compositions"

/** Rótulo de fallback para composições sem `category` definida. */
export const UNCATEGORIZED = "Outras"

/** Ordem conhecida das categorias; demais entram por ordem de aparição. */
const CATEGORY_ORDER = ["Marketing", "Aplicação", "Showcase"]

/** Texto pesquisável de uma composição: slug, nome, descrição e tags. */
export function compositionHaystack(c: Composition): string {
  return [c.slug, c.name, c.description, ...c.tags].join(" ").toLowerCase()
}

/** Casa a composição com a busca (case-insensitive); query vazia casa tudo. */
export function compositionMatches(c: Composition, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return compositionHaystack(c).includes(q)
}

/** Filtro em memória por busca (name/description/tags/slug). */
export function filterCompositions(
  list: Composition[],
  query: string,
): Composition[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter((c) => compositionHaystack(c).includes(q))
}

/**
 * Regex de slugs que são dashboards / "dashboards-like" (workbench DBA,
 * observability, workflow builder, etc.). Casa os 7 slugs canônicos
 * validados pelo orquestrador:
 *   - saas-dashboard
 *   - saas-dashboard-pro
 *   - interactive-dashboard
 *   - workflow-builder
 *   - observability-center
 *   - ai-dashboard-builder
 *   - dba-workbench
 *
 * Mantido aberto o suficiente para absorver composições futuras cujo slug
 * carregue "dashboard", "dba-workbench", "observ", "workflow",
 * "interactive" ou "builder" (a revisão manual de tags continua valendo
 * como rede de segurança).
 */
const DASHBOARD_SLUG_RE =
  /(dashboard|dba-workbench|observ|workflow|interactive|builder)/

/**
 * Predicado de composição dashboard-like. Usado pelo filtro runtime
 * `?category=dashboard` em `/compositions` (REORG task D1) — NÃO altera o
 * registry de composições (categoria formal continua "Aplicação" / etc.).
 *
 * Critério:
 *  1. tag `"dashboard"` presente (contrato atual do registry), OU
 *  2. slug casa o regex `DASHBOARD_SLUG_RE` (cobre workbench, observability,
 *     workflow, builder etc. que não carregam a tag).
 */
export function isDashboardComposition(c: Composition): boolean {
  if (c.tags.includes("dashboard")) return true
  return DASHBOARD_SLUG_RE.test(c.slug)
}

/** Um grupo da navegação: uma categoria + as composições que pertencem a ela. */
export type CompositionGroup = {
  category: string
  compositions: Composition[]
}

/**
 * Agrupa composições por `category`, derivando os grupos dos dados. A ordem
 * segue `CATEGORY_ORDER` para as categorias conhecidas e, em seguida, qualquer
 * categoria nova na ordem em que aparece. Grupos vazios não são produzidos.
 */
export function groupCompositionsByCategory(
  list: Composition[],
): CompositionGroup[] {
  const map = new Map<string, Composition[]>()
  for (const c of list) {
    const category = c.category ?? UNCATEGORIZED
    const arr = map.get(category)
    if (arr) arr.push(c)
    else map.set(category, [c])
  }

  const ordered: string[] = []
  for (const known of CATEGORY_ORDER) {
    if (map.has(known)) ordered.push(known)
  }
  for (const key of map.keys()) {
    if (!ordered.includes(key)) ordered.push(key)
  }

  return ordered.map((category) => ({
    category,
    compositions: map.get(category) ?? [],
  }))
}
