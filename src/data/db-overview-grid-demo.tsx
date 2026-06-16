import { Database } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Database className="size-3.5" aria-hidden="true" />
        <span>Detalhe conectado (render prop customizada)</span>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
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
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          Exemplo de `renderDetail` — substitua pelo `db-schema-explorer`
          quando ambos os componentes integrarem a vitrine.
        </Badge>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
          Fechar
        </Button>
      </div>
    </div>
  )
}
