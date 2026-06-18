/**
 * Demo do ErrorTrackerFeed usado no example "Filtrado por prod + status 'new'".
 *
 * Replica o mesmo pattern do `timeline-demo.tsx`: o wrapper que aplica
 * filtros iniciais via DOM está num arquivo separado para satisfazer
 * `react-refresh/only-export-components` — o arquivo de examples só pode
 * exportar não-componentes.
 *
 * Estratégia: o componente `ProdNewFilteredFeed` re-clica programaticamente
 * os toggles de filtro "prod" e "new" na primeira renderização, simulando
 * o usuário aplicando esses filtros. Sem timers, sem `Math.random`, sem
 * estado externo — comportamento determinístico.
 *
 * O React 19 strict mode monta o componente 2x em dev — usamos um
 * `useRef` para garantir idempotência.
 */

import * as React from "react"

import { ErrorTrackerFeed } from "@/components/ui/error-tracker-feed"
import type { ErrorEventItem } from "@/components/ui/error-tracker-feed-types"

function ApplyInitialFilters({ rootRef }: { rootRef: React.RefObject<HTMLDivElement | null> }) {
  const appliedRef = React.useRef(false)
  React.useEffect(() => {
    if (appliedRef.current) return
    if (!rootRef.current) return
    appliedRef.current = true
    const root = rootRef.current
    const prod = root.querySelector(
      '[data-slot="etf-env-toggle"][data-env="prod"]',
    ) as HTMLButtonElement | null
    prod?.click()
    const newBtn = root.querySelector(
      '[data-slot="etf-status-toggle"][data-status="new"]',
    ) as HTMLButtonElement | null
    newBtn?.click()
  }, [rootRef])
  return null
}

function ProdNewFilteredFeed({ errors }: { errors: ErrorEventItem[] }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={wrapperRef} className="w-full">
      <ErrorTrackerFeed errors={errors} groupBy="type" filterable />
      <ApplyInitialFilters rootRef={wrapperRef} />
    </div>
  )
}

export { ProdNewFilteredFeed }
