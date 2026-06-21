/**
 * Composição "Slow Query List" (slow-query-list).
 *
 * Tela de diagnóstico de queries SQL lentas (estilo pgAdmin / DataDog DBM /
 * pganalyze): seletor de banco + lista de queries com tempo, SQL destacada,
 * plano do EXPLAIN em árvore, locks ativos e sugestões automáticas (índice
 * faltante, rewrite, vacuum). Promovida de Componente → Composição.
 *
 *  - Seletor de banco alterna entre 2 datasets de exemplo: `audit-prod-01`
 *    (threshold 100ms) e `sgt-maker-app` (threshold 50ms, foco em índices
 *    faltantes).
 *  - O `<SlowQueryList>` agrupa por tabela; expanda uma query para ver o plano
 *    do EXPLAIN aninhado e a sugestão de índice composto.
 *
 * Apresentacional (sem backend); dados via fixtures determinísticas.
 */
import { useState } from "react"
import { Database } from "lucide-react"

import { SlowQueryList } from "@/components/ui/slow-query-list"
import { auditQueries, sgtQueries } from "@/data/examples-slow-query-list"
import { cn } from "@/lib/utils"

/** Datasets de exemplo apresentados no seletor da tela. */
const DATASETS = [
  { id: "audit", name: "audit-prod-01", queries: auditQueries, thresholdMs: 100 },
  { id: "sgt", name: "sgt-maker-app", queries: sgtQueries, thresholdMs: 50 },
]

export function SlowQueryListScreen() {
  const [activeId, setActiveId] = useState<string>("audit")
  const active = DATASETS.find((d) => d.id === activeId) ?? DATASETS[0]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
            <Database className="size-4" aria-hidden />
          </span>
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight">
              Slow Query Monitor
            </h1>
            <p className="text-sm text-muted-foreground">
              Queries lentas com plano do EXPLAIN, locks e sugestões de índice.
              Expanda uma query para ver o diagnóstico completo.
            </p>
          </div>
        </div>

        {/* Seletor de banco */}
        <div role="tablist" aria-label="Bancos" className="flex flex-wrap gap-2">
          {DATASETS.map((db) => {
            const isActive = db.id === active.id
            return (
              <button
                key={db.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(db.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-foreground/20 bg-accent text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Database className="size-3.5" aria-hidden />
                {db.name}
                <span className="text-xs font-normal tabular-nums text-muted-foreground/70">
                  &gt;{db.thresholdMs}ms
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <SlowQueryList
        queries={active.queries}
        groupBy="table"
        thresholdMs={active.thresholdMs}
      />
    </div>
  )
}
