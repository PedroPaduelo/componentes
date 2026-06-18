/**
 * Estado de COLAPSO dos DOMÍNIOS da sidebar de docs (1 por domínio macro).
 *
 * ONDA 2 (clusterização): a sidebar passou a listar os 9 GRUPOS organizados sob
 * os 3 DOMÍNIOS macro (`primitivos` → `aplicacoes` → `visual`). O colapso agora
 * acontece por DOMÍNIO (antes era por categoria). A chave de persistência
 * continua `vitrine-docs-collapsed` — entradas antigas (categorias) são apenas
 * ignoradas por não casarem com nenhum `DomainId` (degradação graciosa).
 *
 * Separado num `.ts` (sem JSX) para não violar `react-refresh/only-export-components`
 * no `DocsSidebar.tsx` (que exporta componentes). Responsabilidades:
 *  - manter o conjunto de domínios COLAPSADOS (default: nenhum → tudo expandido);
 *  - persistir em localStorage (`vitrine-docs-collapsed`) com try/catch defensivo;
 *  - auto-expandir o domínio do grupo ativo ao montar/navegar (remove-o do
 *    conjunto colapsado, garantindo que o grupo atual nunca fique escondido);
 *  - expor `isExpanded(domain, searchActive)` que FORÇA todos os domínios
 *    expandidos durante a busca (query não-vazia), sem perder o estado salvo.
 */

import { useCallback, useEffect, useState } from "react"

import { DOMAIN_IDS, type DomainId } from "@/data/groups"

/** Chave de persistência (prefixo `vitrine-`, padrão do projeto). */
const STORAGE_KEY = "vitrine-docs-collapsed"

/** Type guard: o valor (string crua do storage) é um `DomainId` conhecido? */
function isDomainId(value: unknown): value is DomainId {
  return (
    typeof value === "string" &&
    (DOMAIN_IDS as readonly string[]).includes(value)
  )
}

/** Lê o conjunto de domínios colapsados do localStorage de forma segura. */
function readCollapsed(): Set<DomainId> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    // Filtra para `DomainId` válidos → ignora entradas legadas (categorias).
    return new Set(parsed.filter(isDomainId))
  } catch {
    // JSON corrompido / storage indisponível → default seguro (tudo expandido).
    return new Set()
  }
}

/** Persiste o conjunto colapsado no localStorage, ignorando falhas. */
function persistCollapsed(collapsed: Set<DomainId>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]))
  } catch {
    // storage indisponível (modo privado / cota) → silenciosamente ignora.
  }
}

type UseCollapsedGroups = {
  /** Alterna o estado de colapso de um domínio (e persiste). */
  toggle: (domain: DomainId) => void
  /**
   * Resolve se um domínio deve aparecer expandido.
   * @param searchActive quando `true` (busca em curso) força sempre expandido.
   */
  isExpanded: (domain: DomainId, searchActive: boolean) => boolean
}

/**
 * Hook do estado de colapso dos domínios da sidebar.
 *
 * @param activeDomain domínio do grupo da rota atual (auto-expandido).
 */
export function useCollapsedGroups(activeDomain: DomainId | null): UseCollapsedGroups {
  const [collapsed, setCollapsed] = useState<Set<DomainId>>(readCollapsed)

  // Auto-expandir o domínio do grupo ativo: se estiver colapsado, abre.
  useEffect(() => {
    if (!activeDomain) return
    setCollapsed((prev) => {
      if (!prev.has(activeDomain)) return prev
      const next = new Set(prev)
      next.delete(activeDomain)
      persistCollapsed(next)
      return next
    })
  }, [activeDomain])

  const toggle = useCallback((domain: DomainId) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      persistCollapsed(next)
      return next
    })
  }, [])

  const isExpanded = useCallback(
    (domain: DomainId, searchActive: boolean) => {
      if (searchActive) return true
      return !collapsed.has(domain)
    },
    [collapsed],
  )

  return { toggle, isExpanded }
}
