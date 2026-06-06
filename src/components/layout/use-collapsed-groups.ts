/**
 * Estado de COLAPSO dos grupos da sidebar de docs (1 por categoria).
 *
 * Separado num `.ts` (sem JSX) para não violar `react-refresh/only-export-components`
 * no `DocsSidebar.tsx` (que exporta componentes). Responsabilidades:
 *  - manter o conjunto de categorias COLAPSADAS (default: nenhuma → tudo expandido);
 *  - persistir em localStorage (`vitrine-docs-collapsed`) com try/catch defensivo;
 *  - auto-expandir a categoria do item ativo ao montar/navegar (remove-a do
 *    conjunto colapsado, garantindo que o item atual nunca fique escondido);
 *  - expor `isExpanded(category, searchActive)` que FORÇA todos os grupos
 *    expandidos durante a busca (query não-vazia), sem perder o estado salvo.
 */

import { useCallback, useEffect, useState } from "react"

import type { Category } from "@/data/components"

/** Chave de persistência (prefixo `vitrine-`, padrão do projeto). */
const STORAGE_KEY = "vitrine-docs-collapsed"

/** Lê o conjunto de categorias colapsadas do localStorage de forma segura. */
function readCollapsed(): Set<Category> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((c): c is Category => typeof c === "string") as Category[])
  } catch {
    // JSON corrompido / storage indisponível → default seguro (tudo expandido).
    return new Set()
  }
}

/** Persiste o conjunto colapsado no localStorage, ignorando falhas. */
function persistCollapsed(collapsed: Set<Category>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]))
  } catch {
    // storage indisponível (modo privado / cota) → silenciosamente ignora.
  }
}

type UseCollapsedGroups = {
  /** Alterna o estado de colapso de uma categoria (e persiste). */
  toggle: (category: Category) => void
  /**
   * Resolve se um grupo deve aparecer expandido.
   * @param searchActive quando `true` (busca em curso) força sempre expandido.
   */
  isExpanded: (category: Category, searchActive: boolean) => boolean
}

/**
 * Hook do estado de colapso dos grupos da sidebar.
 *
 * @param activeCategory categoria do item da rota atual (auto-expandida).
 */
export function useCollapsedGroups(activeCategory: Category | null): UseCollapsedGroups {
  const [collapsed, setCollapsed] = useState<Set<Category>>(readCollapsed)

  // Auto-expandir a categoria do item ativo: se estiver colapsada, abre.
  useEffect(() => {
    if (!activeCategory) return
    setCollapsed((prev) => {
      if (!prev.has(activeCategory)) return prev
      const next = new Set(prev)
      next.delete(activeCategory)
      persistCollapsed(next)
      return next
    })
  }, [activeCategory])

  const toggle = useCallback((category: Category) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      persistCollapsed(next)
      return next
    })
  }, [])

  const isExpanded = useCallback(
    (category: Category, searchActive: boolean) => {
      if (searchActive) return true
      return !collapsed.has(category)
    },
    [collapsed],
  )

  return { toggle, isExpanded }
}
