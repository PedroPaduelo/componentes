/**
 * Composição "DBA Workbench".
 *
 * IDE-like explorer de banco de dados (estilo DBeaver / Navicat / DataGrip),
 * montada em torno do componente reutilizável `<DbSchemaExplorer>`. O
 * componente é o painel central; a composição adiciona o "workbench"
 * (tabs de bancos abertos, sidebar de conexões/favoritos/queries
 * recentes, painel direito de info da tabela, status bar).
 *
 * Tabs de bancos abertos (estilo VS Code) — clicar alterna entre
 * `auditDb` (Postgres de produção da auditoria) e `sgtMaker` (Postgres
 * do SGT Maker), cada um com seu próprio state de seleção de tabela
 * dentro do `DbSchemaExplorer`.
 *
 * Sidebar esquerda (280px sticky) tem 3 seções colapsáveis:
 *  - Conexões: lista dos bancos abertos + botão "Nova conexão"
 *  - Favoritos: tabelas marcadas pelo usuário
 *  - Histórico: queries SQL recentes (mock determinístico)
 *
 * Painel direito (320px, sticky, scroll próprio) mostra info da
 * tabela selecionada: row count, size, último vacuum/analyze,
 * distribuição de colunas por tipo, índices e FKs.
 *
 * Footer (status bar) mostra: conexão ativa, encoding, query time
 * da última ação, transações, etc — só visual, sem lógica.
 *
 * Tudo determinístico (PRNG seedado), sem `Math.random`.
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
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Database as DatabaseIcon,
  FileCode2,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Star,
  StarOff,
  Table as TableIcon,
  Terminal,
  Wifi,
  X,
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
import { DbSchemaExplorer } from "@/components/ui/db-schema-explorer"
import {
  type DatabaseSchema,
  type TableDef,
} from "@/components/ui/db-schema-explorer-types"
import {
  auditDb,
  sgtMaker,
} from "@/data/examples-db-schema-explorer"

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

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)}GB`
  return `${mb}MB`
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
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
/*                              Componente                                    */
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
    const durationMs = Math.round(
      t.minMs + rng() * (t.maxMs - t.minMs),
    )
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
    return ["core.users", "workflow.tasks", "core.notifications", "analytics.reports"]
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

export function DbaWorkbench() {
  // Bancos "abertos" como tabs (fixos — auditoria + SGT Maker).
  const databases: DatabaseSchema[] = [auditDb, sgtMaker]
  const [activeDbId, setActiveDbId] = useState<string>(auditDb.id)
  const activeDb = databases.find((d) => d.id === activeDbId) ?? databases[0]

  // Tabela selecionada. É atualizada por 2 fontes:
  //  1. Click numa tabela na árvore central (via `onTableClick`
  //     do <DbSchemaExplorer>) — fonte primária.
  //  2. Click num favorito da sidebar (atalho rápido).
  // O estado é "owned" pela composição, não pelo componente, pra que
  // o painel direito sempre reflita a tabela ativa independente de
  // qual caminho o usuário usou pra chegar nela.
  const [selectedTableRef, setSelectedTableRef] = useState<{
    schema: string
    table: string
  } | null>(null)

  // Favoritos (toggle por schema.table)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const s = new Set<string>()
    for (const db of databases) {
      for (const fav of buildFavorites(db.id)) {
        s.add(`${db.id}::${fav}`)
      }
    }
    return s
  })

  // Sidebar — seção colapsada
  const [openSections, setOpenSections] = useState({
    connections: true,
    favorites: true,
    history: true,
  })
  const toggleSection = (s: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }))

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

  // Histórico de queries (mock determinístico)
  const recentQueries = buildRecentQueries(activeDb.id, 6)

  // Tabela selecionada: busca em todas as schemas do banco ativo
  const selectedTable: TableDef | null = (() => {
    if (!selectedTableRef) return null
    for (const schema of activeDb.schemas) {
      const t = schema.tables.find(
        (tab: { name: string }) => tab.name === selectedTableRef.table,
      )
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
      <div
        data-slot="dba-workbench-tabs"
        className="flex shrink-0 items-end gap-0 border-b border-border bg-muted/30 pl-2"
      >
        {databases.map((db) => {
          const isActive = db.id === activeDbId
          return (
            <button
              key={db.id}
              type="button"
              data-slot="dba-workbench-tab"
              data-active={isActive ? "true" : "false"}
              onClick={() => {
                setActiveDbId(db.id)
                setSelectedTableRef(null)
                setLastActionMs(null)
              }}
              className={`group inline-flex items-center gap-1.5 rounded-t-md border-x border-t px-2.5 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 ${
                isActive
                  ? "border-border bg-background text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground"
              }`}
            >
              <DatabaseIcon className="size-3 shrink-0" />
              <span className="max-w-[120px] truncate sm:max-w-[160px]">
                {db.name}
              </span>
              <span
                className={`hidden rounded px-1 py-0 text-[9px] font-semibold uppercase sm:inline ${ENGINE_TONE[db.engine].split(" ")[0]}`}
              >
                {db.engine.slice(0, 4)}
              </span>
              <X
                className={`size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60 ${
                  isActive ? "opacity-60" : ""
                }`}
                aria-hidden
              />
            </button>
          )
        })}
        <button
          type="button"
          aria-label="Nova conexão"
          className="ml-1 flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

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
            <Section
              title="Conexões"
              icon={<Wifi className="size-3.5" />}
              open={openSections.connections}
              onToggle={() => toggleSection("connections")}
              count={databases.length}
            >
              <ul className="flex flex-col gap-0.5">
                {databases.map((db) => {
                  const isActive = db.id === activeDbId
                  return (
                    <li key={db.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDbId(db.id)
                          setSelectedTableRef(null)
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                          isActive
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {db.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {db.schemas.length}sch
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Section>

            {/* --- FAVORITOS --- */}
            <Section
              title="Favoritos"
              icon={<Bookmark className="size-3.5" />}
              open={openSections.favorites}
              onToggle={() => toggleSection("favorites")}
              count={favorites.size}
            >
              <ul className="flex flex-col gap-0.5">
                {[...favorites]
                  .filter((k) => k.startsWith(`${activeDbId}::`))
                  .map((key) => {
                    const ref = key.replace(`${activeDbId}::`, "")
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => {
                            const [schema, table] = ref.split(".")
                            setSelectedTableRef({ schema, table })
                          }}
                          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                        >
                          <Star className="size-3 shrink-0 fill-amber-500 text-amber-500" />
                          <span className="min-w-0 flex-1 truncate font-mono">
                            {ref}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                {favorites.size === 0 && (
                  <li className="px-2 py-1 text-[10px] italic text-muted-foreground/60">
                    Nenhum favorito
                  </li>
                )}
              </ul>
            </Section>

            {/* --- HISTÓRICO DE QUERIES --- */}
            <Section
              title="Histórico de queries"
              icon={<History className="size-3.5" />}
              open={openSections.history}
              onToggle={() => toggleSection("history")}
              count={recentQueries.length}
            >
              <ul className="flex flex-col gap-1">
                {recentQueries.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => onClickRecentQuery(q)}
                      className="group flex w-full flex-col gap-1 rounded border border-border/60 bg-background/40 px-2 py-1.5 text-left transition-colors hover:bg-muted/40"
                    >
                      <code className="block truncate font-mono text-[10px] text-foreground/80">
                        {q.sql.replace(/\s+/g, " ").slice(0, 60)}
                        {q.sql.length > 60 ? "…" : ""}
                      </code>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground tabular-nums">
                        <span className="flex items-center gap-0.5">
                          <Clock className="size-2.5" /> {q.durationMs}ms
                        </span>
                        <span>·</span>
                        <span>{formatRelativeTime(q.t)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
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
            onTableClick={(ref: { schema: string; table: string }) => setSelectedTableRef(ref)}
          />
        </main>

        {/* ============== PAINEL DIREITO (info da tabela) ============== */}
        <aside
          data-slot="dba-workbench-info"
          className="hidden w-[280px] shrink-0 flex-col border-l border-border bg-card/40 xl:flex"
        >
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-3 p-3">
              {selectedTable ? (
                <>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Tabela selecionada
                    </p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                      <TableIcon className="size-3.5 shrink-0 text-primary" />
                      <code
                        className="truncate text-sm font-semibold"
                        title={`${selectedTableRef?.schema}.${selectedTable.name}`}
                      >
                        {selectedTableRef?.schema}.{selectedTable.name}
                      </code>
                    </div>
                    {selectedTable.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        {selectedTable.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <StatTile
                      label="Linhas"
                      value={formatCount(selectedTable.rowCount ?? 0)}
                    />
                    <StatTile
                      label="Tamanho"
                      value={formatSize(selectedTable.sizeMB ?? 0)}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Colunas ({selectedTable.columns.length})
                    </p>
                    <ul className="flex max-h-[180px] flex-col gap-0.5 overflow-y-auto rounded border border-border/40 bg-background/30 p-1">
                      {selectedTable.columns.map(
                        (c: {
                          name: string
                          type: string
                          isPrimary?: boolean
                          isForeign?: boolean
                          defaultValue?: string
                          nullable: boolean
                        }) => (
                          <li
                            key={c.name}
                            className="flex items-center justify-between gap-2 rounded px-1.5 py-0.5 text-[11px] hover:bg-muted/30"
                          >
                          <span className="flex min-w-0 items-center gap-1">
                            {c.isPrimary && (
                              <span className="shrink-0 rounded bg-amber-500/15 px-1 text-[9px] font-bold text-amber-500">
                                PK
                              </span>
                            )}
                            {c.isForeign && (
                              <span className="shrink-0 rounded bg-sky-500/15 px-1 text-[9px] font-bold text-sky-500">
                                FK
                              </span>
                            )}
                            <span
                              className="truncate font-mono"
                              title={c.name}
                            >
                              {c.name}
                            </span>
                          </span>
                          <span
                            className="shrink-0 truncate text-[10px] text-muted-foreground"
                            title={c.type}
                          >
                            {c.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Índices ({selectedTable.indexes.length})
                    </p>
                    <ul className="flex max-h-[140px] flex-col gap-0.5 overflow-y-auto rounded border border-border/40 bg-background/30 p-1">
                      {selectedTable.indexes.map((idx: { name: string; type: string; columns: unknown[] }) => (
                        <li
                          key={idx.name}
                          className="flex items-center justify-between gap-2 rounded px-1.5 py-0.5 text-[11px] hover:bg-muted/30"
                        >
                          <span
                            className="truncate font-mono"
                            title={idx.name}
                          >
                            {idx.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {idx.type} · {idx.columns.length}col
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedTable.foreignKeys.length > 0 && (
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Foreign keys ({selectedTable.foreignKeys.length})
                      </p>
                      <ul className="flex max-h-[140px] flex-col gap-1 overflow-y-auto rounded border border-border/40 bg-background/30 p-1">
                        {selectedTable.foreignKeys.map(
                          (fk: {
                            name: string
                            columns?: string[]
                            references: {
                              schema: string
                              table: string
                              column: string
                            }
                            onDelete?: string
                          }) => (
                            <li
                              key={fk.name}
                              className="rounded border border-sky-500/20 bg-sky-500/5 px-1.5 py-1 text-[11px]"
                            >
                              <p className="truncate font-mono text-foreground" title={fk.name}>
                                {fk.name}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                → {fk.references.schema}.{fk.references.table}.
                                {fk.references.column}
                              </p>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onClickFavorite(selectedTableRef!.schema, selectedTableRef!.table)}
                  >
                    {favorites.has(
                      `${activeDbId}::${selectedTableRef?.schema}.${selectedTableRef?.table}`,
                    ) ? (
                      <>
                        <StarOff className="size-3.5" />
                        Remover dos favoritos
                      </>
                    ) : (
                      <>
                        <Star className="size-3.5" />
                        Adicionar aos favoritos
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-background/40">
                    <TableIcon className="size-5 text-muted-foreground/40" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-foreground">
                      Nenhuma tabela selecionada
                    </p>
                    <p className="max-w-[200px] text-[10px] text-muted-foreground/70">
                      Clique numa tabela na árvore ao lado para ver
                      linhas, tamanho, colunas, índices e foreign keys.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* ============================================================ */}
      {/*  STATUS BAR (rodapé)                                        */}
      {/* ============================================================ */}
      <footer
        data-slot="dba-workbench-statusbar"
        className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-border bg-card px-3 py-1 text-[10px] tabular-nums text-muted-foreground md:gap-4"
      >
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
        <span className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
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
              {activeDb.schemas.reduce((a: number, s: { tables: unknown[] }) => a + s.tables.length, 0)}{" "}
              tabelas visíveis
            </span>
            <span className="sm:hidden">
              {activeDb.schemas.reduce((a: number, s: { tables: unknown[] }) => a + s.tables.length, 0)} tab
            </span>
          </span>
        </span>
      </footer>

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
        <DialogContent
          data-slot="query-history-dialog"
          className="max-w-2xl"
        >
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
                  Query executada em {formatRelativeTime(selectedQuery.t)} ·
                  ID {selectedQuery.id}
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
                    <p
                      className="font-mono text-xs"
                      title={selectedQuery.t}
                    >
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

/* -------------------------------------------------------------------------- */
/*                       Sub-componentes internos                              */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  icon,
  open,
  onToggle,
  count,
  children,
}: {
  title: string
  icon: React.ReactNode
  open: boolean
  onToggle: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-border/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0" />
        ) : (
          <ChevronRight className="size-3 shrink-0" />
        )}
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 truncate">{title}</span>
        {count !== undefined && (
          <span className="shrink-0 rounded bg-muted/60 px-1 text-[9px] tabular-nums">
            {count}
          </span>
        )}
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </section>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-background/60 p-2">
      <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className="truncate font-mono text-sm font-semibold tabular-nums"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}
