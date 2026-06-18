/**
 * Composição "DBA Workbench".
 *
 * IDE-like explorer de banco de dados (estilo DBeaver / Navicat / DataGrip),
 * montada em torno do componente reutilizável `<DbSchemaExplorer>`. O
 * componente é o painel central; a composição adiciona o "workbench"
 * (tabs de bancos abertos, sidebar de conexões/favoritos/queries
 * recentes, painel direito de info da tabela, status bar).
 *
 * Componentização: as peças visuais genéricas do workbench foram extraídas
 * para componentes registrados (`@/components/ui/*`) e são reusadas aqui —
 * esta composição só orquestra o estado e o layout. São elas:
 *  - `DatabaseTabBar`: as tabs de bancos abertos (estilo VS Code).
 *  - `CollapsibleSection`: a casca das 3 seções colapsáveis da sidebar.
 *  - `ConnectionList` / `FavoritesList` / `QueryHistoryList`: as 3 listas.
 *  - `TableInfoPanel`: o painel direito de info da tabela selecionada.
 *  - `WorkbenchStatusBar`: o footer/status bar.
 *  - `StatTile`: reusado dentro do `TableInfoPanel`.
 *
 * O que permanece inline é app-specific: o `QueryDetailDialog` (modal com o
 * SQL completo + metadados da query do histórico) e a geração determinística
 * dos dados mock.
 *
 * Tudo determinístico (PRNG seedado), sem `Math.random` nos dados.
 *
 * O componente `DbSchemaExplorer` continua existindo e sendo
 * usável standalone (página /components/db-schema-explorer) — a
 * composição é a versão "completa, com workbench".
 */

import { useEffect, useRef, useState } from "react"
import {
  Activity,
  Bookmark,
  Check,
  Clock,
  Copy,
  Database as DatabaseIcon,
  FileCode2,
  History,
  Loader2,
  RefreshCw,
  Settings,
  Terminal,
  Wifi,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { ConnectionList } from "@/components/ui/connection-list"
import { DatabaseTabBar } from "@/components/ui/database-tab-bar"
import { FavoritesList } from "@/components/ui/favorites-list"
import { QueryHistoryList } from "@/components/ui/query-history-list"
import { TableInfoPanel } from "@/components/ui/table-info-panel"
import { WorkbenchStatusBar } from "@/components/ui/workbench-status-bar"
import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"
import {
  type DatabaseSchema,
  type TableDef,
} from "@/components/ui/db-schema-explorer-types"
import { auditDb, sgtMaker } from "@/data/examples-db-schema-explorer"

/* -------------------------------------------------------------------------- */
/*                            helpers determinísticos                          */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso)
  if (Number.isNaN(diffMs)) return "—"
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return "agora há pouco"
  if (min < 60) return `há ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `há ${hr}h`
  const day = Math.floor(hr / 24)
  return `há ${day}d`
}

function formatIsoShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm} ${hh}:${min}`
}

/* -------------------------------------------------------------------------- */
/*                              Dados (mock)                                   */
/* -------------------------------------------------------------------------- */

type RecentQuery = {
  id: string
  sql: string
  durationMs: number
  t: string
  databaseId: string
}

function buildRecentQueries(databaseId: string, count: number): RecentQuery[] {
  const templates = [
    {
      sql: "SELECT count(*) FROM events WHERE created_at > now() - interval '1 hour'",
      minMs: 12,
      maxMs: 80,
    },
    {
      sql: "SELECT id, email FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
      minMs: 8,
      maxMs: 45,
    },
    {
      sql: "VACUUM (ANALYZE) orders",
      minMs: 240,
      maxMs: 1200,
    },
    {
      sql: "EXPLAIN ANALYZE SELECT * FROM order_items WHERE order_id = $1",
      minMs: 4,
      maxMs: 32,
    },
    {
      sql: "SELECT pg_size_pretty(pg_database_size(current_database()))",
      minMs: 2,
      maxMs: 6,
    },
    {
      sql: "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20",
      minMs: 18,
      maxMs: 95,
    },
  ]
  const rng = mulberry32(seedFromString(`${databaseId}-queries`))
  const out: RecentQuery[] = []
  for (let i = 0; i < count; i++) {
    const t = templates[Math.floor(rng() * templates.length)]
    const durationMs = Math.round(t.minMs + rng() * (t.maxMs - t.minMs))
    out.push({
      id: `q-${i}-${databaseId}`,
      sql: t.sql,
      durationMs,
      t: new Date(Date.now() - (i + 1) * 7 * 60 * 1000).toISOString(),
      databaseId,
    })
  }
  return out
}

function buildFavorites(databaseId: string): string[] {
  // Cada banco tem 4 tabelas "favoritadas" determinísticas.
  if (databaseId === "audit-db") {
    return ["iam.users", "audit.events", "iam.sessions", "billing.invoices"]
  }
  if (databaseId === "sgt-maker-db") {
    return [
      "core.users",
      "workflow.tasks",
      "core.notifications",
      "analytics.reports",
    ]
  }
  return []
}

/* Engines → cor/label do accent */
const ENGINE_LABEL: Record<DatabaseSchema["engine"], string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlserver: "SQL Server",
  oracle: "Oracle",
  sqlite: "SQLite",
}

const ENGINE_TONE: Record<DatabaseSchema["engine"], string> = {
  postgresql: "text-sky-500 bg-sky-500/10 border-sky-500/30",
  mysql: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  sqlserver: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  oracle: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  sqlite: "text-gray-500 bg-gray-500/10 border-gray-500/30",
}

/** Bancos "configurados" (abríveis como tabs). */
const ALL_DBS: DatabaseSchema[] = [auditDb, sgtMaker]

/* -------------------------------------------------------------------------- */
/*                              Componente                                    */
/* -------------------------------------------------------------------------- */

export function DbaWorkbench() {
  // Bancos "abertos" como tabs (estilo VS Code, com close/reopen).
  const [openDbIds, setOpenDbIds] = useState<string[]>(() =>
    ALL_DBS.map((d) => d.id),
  )
  const [activeDbId, setActiveDbId] = useState<string>(auditDb.id)
  const activeDb = ALL_DBS.find((d) => d.id === activeDbId) ?? ALL_DBS[0]
  const openDatabases = ALL_DBS.filter((d) => openDbIds.includes(d.id))

  // Tabela selecionada. É atualizada por 3 fontes:
  //  1. Click numa tabela na árvore central (via `onTableClick`).
  //  2. Click num favorito da sidebar (atalho rápido).
  //  3. Click numa FK no painel direito (navegação).
  // O estado é "owned" pela composição, não pelo componente, pra que o painel
  // direito sempre reflita a tabela ativa independente do caminho usado.
  const [selectedTableRef, setSelectedTableRef] = useState<{
    schema: string
    table: string
  } | null>(null)

  // Favoritos (toggle por schema.table, namespaced por banco)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const s = new Set<string>()
    for (const db of ALL_DBS) {
      for (const fav of buildFavorites(db.id)) {
        s.add(`${db.id}::${fav}`)
      }
    }
    return s
  })

  // Sidebar — estado aberto/fechado de cada seção
  const [openSections, setOpenSections] = useState({
    connections: true,
    favorites: true,
    history: true,
  })

  // Status bar — "query time" simulado
  const [lastActionMs, setLastActionMs] = useState<number | null>(null)

  // Dialog de detalhes da query (aberto pelo histórico lateral)
  const [selectedQuery, setSelectedQuery] = useState<RecentQuery | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup do timer de "copied" ao desmontar
  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current)
      }
    },
    [],
  )

  const copySql = async (sql: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(sql)
      }
    } catch {
      /* clipboard indisponível — silencioso */
    }
    setCopied(true)
    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false)
      copyTimeoutRef.current = null
    }, 2000)
  }

  /* ------- tabs (abrir / selecionar / fechar) ------- */

  const selectDb = (id: string) => {
    setActiveDbId(id)
    setSelectedTableRef(null)
    setLastActionMs(null)
  }
  const openDb = (id: string) => {
    setOpenDbIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    selectDb(id)
  }
  const closeDb = (id: string) => {
    if (openDbIds.length <= 1) return
    const next = openDbIds.filter((x) => x !== id)
    setOpenDbIds(next)
    if (id === activeDbId) {
      setActiveDbId(next[0])
      setSelectedTableRef(null)
      setLastActionMs(null)
    }
  }
  const newConnection = () => setOpenDbIds(ALL_DBS.map((d) => d.id))

  // Histórico de queries (mock determinístico)
  const recentQueries = buildRecentQueries(activeDb.id, 6)

  // Tabela selecionada: busca em todas as schemas do banco ativo
  const selectedTable: TableDef | null = (() => {
    if (!selectedTableRef) return null
    for (const schema of activeDb.schemas) {
      const t = schema.tables.find((tab) => tab.name === selectedTableRef.table)
      if (t) return t
    }
    return null
  })()

  const onClickFavorite = (schema: string, table: string) => {
    const key = `${activeDbId}::${schema}.${table}`
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setLastActionMs(Math.floor(20 + Math.random() * 30))
  }

  const onClickRecentQuery = (q: RecentQuery) => {
    setSelectedQuery(q)
    setLastActionMs(q.durationMs)
  }

  /* ------- dados derivados para as listas / status bar ------- */

  const favoriteItems = [...favorites]
    .filter((k) => k.startsWith(`${activeDbId}::`))
    .map((key) => ({ id: key, label: key.replace(`${activeDbId}::`, "") }))

  const selectFavorite = (id: string) => {
    const [schema, table] = id.replace(`${activeDbId}::`, "").split(".")
    setSelectedTableRef({ schema, table })
  }

  const historyItems = recentQueries.map((q) => ({
    id: q.id,
    sql: q.sql,
    durationMs: q.durationMs,
    timeLabel: formatRelativeTime(q.t),
  }))

  const selectHistory = (item: { id: string }) => {
    const q = recentQueries.find((r) => r.id === item.id)
    if (q) onClickRecentQuery(q)
  }

  const tablesVisible = activeDb.schemas.reduce(
    (a, s) => a + s.tables.length,
    0,
  )

  return (
    <div
      data-slot="dba-workbench"
      className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground"
    >
      {/* ============================================================ */}
      {/*  TOPBAR — logo, banco ativo, ações globais                   */}
      {/* ============================================================ */}
      <header
        data-slot="dba-workbench-topbar"
        className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2 lg:gap-3"
      >
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <DatabaseIcon className="size-4" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold tracking-tight">DBA Workbench</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {activeDb.schemas.length} schemas · {activeDb.tables} tabelas
            </p>
          </div>
        </div>

        <div className="mx-1 hidden h-6 w-px shrink-0 bg-border lg:mx-2 lg:block" />

        <Badge
          variant="outline"
          className={`hidden gap-1.5 border ${ENGINE_TONE[activeDb.engine]} sm:inline-flex`}
        >
          <DatabaseIcon className="size-3 shrink-0" />
          <span className="whitespace-nowrap">
            {ENGINE_LABEL[activeDb.engine]} {activeDb.version}
          </span>
        </Badge>
        <span className="hidden font-mono text-xs text-muted-foreground xl:inline">
          {activeDb.host}:{activeDb.port ?? 5432}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => setLastActionMs(Math.floor(20 + Math.random() * 80))}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex">
            <FileCode2 className="size-3.5" />
            Export DDL
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex">
            <Terminal className="size-3.5" />
            Query
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Configurações"
            className="size-8"
          >
            <Settings className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  TABS de bancos abertos (estilo VS Code)                    */}
      {/* ============================================================ */}
      <DatabaseTabBar
        tabs={openDatabases.map((db) => ({
          id: db.id,
          label: db.name,
          icon: DatabaseIcon,
          meta: (
            <span
              className={`hidden rounded px-1 py-0 text-[9px] font-semibold uppercase sm:inline ${ENGINE_TONE[db.engine].split(" ")[0]}`}
            >
              {db.engine.slice(0, 4)}
            </span>
          ),
        }))}
        activeId={activeDbId}
        onSelect={selectDb}
        onClose={closeDb}
        onNew={newConnection}
        newLabel="Nova conexão"
      />

      {/* ============================================================ */}
      {/*  MAIN: Sidebar | Centro (DbSchemaExplorer) | Painel direito  */}
      {/* ============================================================ */}
      <div className="flex min-h-0 min-w-0 flex-1">
        {/* ============== SIDEBAR ESQUERDA ============== */}
        <aside
          data-slot="dba-workbench-sidebar"
          className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card/40 md:w-[240px] xl:w-[260px]"
        >
          <ScrollArea className="flex-1">
            {/* --- CONEXÕES --- */}
            <CollapsibleSection
              title="Conexões"
              icon={<Wifi className="size-3.5" />}
              open={openSections.connections}
              onOpenChange={(o) =>
                setOpenSections((p) => ({ ...p, connections: o }))
              }
              action={
                <span className="rounded bg-muted/60 px-1 text-[9px] tabular-nums">
                  {ALL_DBS.length}
                </span>
              }
              className="border-b border-border/60"
              headerClassName="gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            >
              <ConnectionList
                items={ALL_DBS.map((db) => ({
                  id: db.id,
                  name: db.name,
                  meta: `${db.schemas.length}sch`,
                }))}
                activeId={activeDbId}
                onSelect={openDb}
              />
            </CollapsibleSection>

            {/* --- FAVORITOS --- */}
            <CollapsibleSection
              title="Favoritos"
              icon={<Bookmark className="size-3.5" />}
              open={openSections.favorites}
              onOpenChange={(o) =>
                setOpenSections((p) => ({ ...p, favorites: o }))
              }
              action={
                <span className="rounded bg-muted/60 px-1 text-[9px] tabular-nums">
                  {favoriteItems.length}
                </span>
              }
              className="border-b border-border/60"
              headerClassName="gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            >
              <FavoritesList items={favoriteItems} onSelect={selectFavorite} />
            </CollapsibleSection>

            {/* --- HISTÓRICO DE QUERIES --- */}
            <CollapsibleSection
              title="Histórico de queries"
              icon={<History className="size-3.5" />}
              open={openSections.history}
              onOpenChange={(o) =>
                setOpenSections((p) => ({ ...p, history: o }))
              }
              action={
                <span className="rounded bg-muted/60 px-1 text-[9px] tabular-nums">
                  {historyItems.length}
                </span>
              }
              className="border-b border-border/60"
              headerClassName="gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            >
              <QueryHistoryList items={historyItems} onSelect={selectHistory} />
            </CollapsibleSection>
          </ScrollArea>
        </aside>

        {/* ============== CENTRO (DbSchemaExplorer) ============== */}
        <main
          data-slot="dba-workbench-main"
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
        >
          <DbSchemaExplorer
            database={activeDb}
            embedded
            onTableClick={(ref: { schema: string; table: string }) =>
              setSelectedTableRef(ref)
            }
          />
        </main>

        {/* ============== PAINEL DIREITO (info da tabela) ============== */}
        <aside
          data-slot="dba-workbench-info"
          className="hidden w-[280px] shrink-0 flex-col border-l border-border bg-card/40 xl:flex"
        >
          <TableInfoPanel
            table={selectedTable}
            schemaName={selectedTableRef?.schema}
            isFavorite={
              selectedTableRef
                ? favorites.has(
                    `${activeDbId}::${selectedTableRef.schema}.${selectedTableRef.table}`,
                  )
                : false
            }
            onToggleFavorite={
              selectedTableRef
                ? () =>
                    onClickFavorite(
                      selectedTableRef.schema,
                      selectedTableRef.table,
                    )
                : undefined
            }
            onNavigateFk={(ref) =>
              setSelectedTableRef({ schema: ref.schema, table: ref.table })
            }
          />
        </aside>
      </div>

      {/* ============================================================ */}
      {/*  STATUS BAR (rodapé)                                        */}
      {/* ============================================================ */}
      <WorkbenchStatusBar
        left={
          <>
            <span className="flex shrink-0 items-center gap-1">
              <span
                className="size-1.5 rounded-full bg-emerald-500"
                aria-hidden
              />
              conectado
            </span>
            <span className="hidden shrink-0 items-center gap-1 sm:flex">
              <DatabaseIcon className="size-3" />
              <span className="max-w-[140px] truncate" title={activeDb.name}>
                {activeDb.name}
              </span>
            </span>
            <span className="hidden shrink-0 md:inline">encoding: UTF8</span>
            <span className="hidden shrink-0 lg:inline">read-only: off</span>
          </>
        }
        right={
          <>
            {lastActionMs !== null ? (
              <span className="flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                <span className="hidden sm:inline">última query: </span>
                {lastActionMs}ms
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Activity className="size-3" />
                <span className="hidden sm:inline">idle</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              <span className="hidden sm:inline">
                {tablesVisible} tabelas visíveis
              </span>
              <span className="sm:hidden">{tablesVisible} tab</span>
            </span>
          </>
        }
      />

      {/* ============================================================ */}
      {/*  DIALOG — detalhes da query selecionada no histórico        */}
      {/* ============================================================ */}
      <Dialog
        open={selectedQuery !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedQuery(null)
            setCopied(false)
          }
        }}
      >
        <DialogContent data-slot="query-history-dialog" className="max-w-2xl">
          {selectedQuery && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DatabaseIcon className="size-4 text-primary" />
                  <DialogTitle>Detalhes da query</DialogTitle>
                  <Badge
                    variant="outline"
                    className={`ml-auto gap-1 border ${ENGINE_TONE[activeDb.engine]}`}
                  >
                    <DatabaseIcon className="size-3" />
                    {ENGINE_LABEL[activeDb.engine]} · {activeDb.name}
                  </Badge>
                </div>
                <DialogDescription>
                  Query executada em {formatRelativeTime(selectedQuery.t)} · ID{" "}
                  {selectedQuery.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* SQL completo formatado */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      SQL
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySql(selectedQuery.sql)}
                      className="h-6 px-2 text-[10px]"
                    >
                      {copied ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                  <pre className="max-h-[300px] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
                    <code className="font-mono whitespace-pre-wrap break-words">
                      {selectedQuery.sql}
                    </code>
                  </pre>
                </div>

                {/* Metadata em grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-border bg-background/60 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Duração
                    </p>
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {selectedQuery.durationMs}ms
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-background/60 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Executada
                    </p>
                    <p className="font-mono text-xs" title={selectedQuery.t}>
                      {formatRelativeTime(selectedQuery.t)}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-background/60 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Timestamp
                    </p>
                    <p className="font-mono text-[10px]">
                      {formatIsoShort(selectedQuery.t)}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedQuery(null)
                    setCopied(false)
                  }}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
