/**
 * Estado de COLAPSO dos grupos da sidebar de composições (1 por categoria).
 *
 * Análogo a `use-collapsed-groups.ts` (sidebar de componentes), mas:
 *  - a categoria aqui é `string` livre (não a union `Category`);
 *  - persiste sob chave PRÓPRIA `vitrine-compositions-collapsed` (não colide
 *    com `vitrine-docs-collapsed`).
 *
 * Em `.ts` (sem JSX) para não violar `react-refresh/only-export-components` no
 * `CompositionsSidebar.tsx`. Responsabilidades: manter o conjunto de categorias
 * COLAPSADAS (default: nenhuma → tudo expandido), persistir com try/catch
 * defensivo, auto-expandir a categoria do item ativo e forçar tudo expandido
 * durante a busca.
 */

import { useCallback, useEffect, useState } from "react"

/** Chave de persistência própria (prefixo `vitrine-`, padrão do projeto). */
const STORAGE_KEY = "vitrine-compositions-collapsed"

/** Lê o conjunto de categorias colapsadas do localStorage de forma segura. */
function readCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((c): c is string => typeof c === "string"))
  } catch {
    // JSON corrompido / storage indisponível → default seguro (tudo expandido).
    return new Set()
  }
}

/** Persiste o conjunto colapsado no localStorage, ignorando falhas. */
function persistCollapsed(collapsed: Set<string>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]))
  } catch {
    // storage indisponível (modo privado / cota) → silenciosamente ignora.
  }
}

type UseCompositionsCollapsedGroups = {
  /** Alterna o estado de colapso de uma categoria (e persiste). */
  toggle: (category: string) => void
  /**
   * Resolve se um grupo deve aparecer expandido.
   * @param searchActive quando `true` (busca em curso) força sempre expandido.
   */
  isExpanded: (category: string, searchActive: boolean) => boolean
}

/**
 * Hook do estado de colapso dos grupos da sidebar de composições.
 *
 * @param activeCategory categoria da composição da rota atual (auto-expandida).
 */
export function useCompositionsCollapsedGroups(
  activeCategory: string | null,
): UseCompositionsCollapsedGroups {
  const [collapsed, setCollapsed] = useState<Set<string>>(readCollapsed)

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

  const toggle = useCallback((category: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      persistCollapsed(next)
      return next
    })
  }, [])

  const isExpanded = useCallback(
    (category: string, searchActive: boolean) => {
      if (searchActive) return true
      return !collapsed.has(category)
    },
    [collapsed],
  )

  return { toggle, isExpanded }
}
