import { Database } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { DatabaseInstance } from "@/components/ui/db-overview-grid-types"

/**
 * Conteúdo customizado do Dialog de detalhe do `DbOverviewGrid` para os
 * examples da vitrine. Substituível por `db-schema-explorer` quando
 * ambos os componentes integrarem a vitrine.
 */
export function DbOverviewGridCustomDetail({
  database,
}: {
  database: DatabaseInstance
}) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Database className="size-3.5" aria-hidden="true" />
        <span>Detalhe conectado (render prop customizada)</span>
      </div>

      {/* Resumo em 2 colunas (campos chave) */}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Identificação
          </div>
          <dl className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">id</dt>
              <dd className="truncate font-mono text-foreground">{database.id}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">engine</dt>
              <dd className="font-mono text-foreground">{database.engine}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">host</dt>
              <dd className="truncate font-mono text-foreground">
                {database.host}:{database.port}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">version</dt>
              <dd className="font-mono text-foreground">{database.version}</dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0 rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Estado atual
          </div>
          <dl className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">status</dt>
              <dd className="font-mono text-foreground">{database.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">connections</dt>
              <dd className="font-mono text-foreground">
                {database.currentConnections}/{database.maxConnections}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">cache hit</dt>
              <dd className="font-mono text-foreground">
                {Math.round(database.cacheHitRatio * 100)}%
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">repl lag</dt>
              <dd className="font-mono text-foreground">
                {database.replicationLagMs === undefined
                  ? "—"
                  : `${database.replicationLagMs}ms`}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* JSON bruto em bloco scrollável, contido no dialog */}
      <div className="min-w-0 space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Raw payload
        </div>
        <pre className="max-w-full overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
          {JSON.stringify(
            {
              id: database.id,
              name: database.name,
              env: database.env,
              engine: database.engine,
              version: database.version,
              host: database.host,
              port: database.port,
              status: database.status,
              currentConnections: database.currentConnections,
              maxConnections: database.maxConnections,
              replicationLagMs: database.replicationLagMs ?? null,
              cacheHitRatio: database.cacheHitRatio,
              topTables: database.topTables.map((t) => t.name),
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="text-xs">
          Exemplo de `renderDetail` — substitua pelo `db-schema-explorer`
          quando ambos os componentes integrarem a vitrine.
        </Badge>
      </div>
    </div>
  )
}
