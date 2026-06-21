/**
 * Composição "DB Schema Explorer" (db-schema-explorer).
 *
 * Tela de exploração de schema de banco no estilo DBeaver / Navicat / pgAdmin,
 * construída em torno do componente reutilizável `<DbSchemaExplorer>`. Promovida
 * de Componente → Composição: é um mini-app de tela inteira (seletor de conexão
 * + árvore de schemas/tabelas com busca + painel de detalhe com 4 abas), não um
 * bloco pontual.
 *
 *  - Seletor de conexão no topo (tabs) alterna entre 2 bancos de exemplo:
 *    `audit-prod-01` (5 schemas · 24 tabelas) e `sgt-maker-app` (3 · 12).
 *  - O `<DbSchemaExplorer>` provê a árvore (banco → schemas → tabelas) com
 *    busca em tempo real + toggle "Só com FK", e o painel de detalhe com abas
 *    Columns / Indexes / Foreign keys / DDL. Clicar numa FK salta para a tabela
 *    alvo.
 *
 * Apresentacional (sem backend); dados via fixtures determinísticas.
 */
import { useState } from "react"
import { Database } from "lucide-react"

import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"
import { auditDb, sgtMaker } from "@/data/examples-db-schema-explorer"
import { cn } from "@/lib/utils"

/** Conexões de exemplo apresentadas no seletor da tela. */
const DATABASES = [auditDb, sgtMaker]

export function DbSchemaExplorerScreen() {
  const [activeId, setActiveId] = useState<string>(auditDb.id)
  const active = DATABASES.find((d) => d.id === activeId) ?? auditDb

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
            <Database className="size-4" aria-hidden />
          </span>
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight">
              Database Schema Explorer
            </h1>
            <p className="text-sm text-muted-foreground">
              Navegue schemas, tabelas, índices e foreign keys — clique numa FK
              para saltar à tabela alvo.
            </p>
          </div>
        </div>

        {/* Seletor de conexão (tabs) */}
        <div
          role="tablist"
          aria-label="Conexões"
          className="flex flex-wrap gap-2"
        >
          {DATABASES.map((db) => {
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
                  {db.tables} tbl
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <DbSchemaExplorer database={active} />
    </div>
  )
}
