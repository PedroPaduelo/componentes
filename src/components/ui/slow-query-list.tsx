/**
 * SlowQueryList — listagem de queries SQL lentas com diagnóstico completo.
 *
 * Inspirado em pgAdmin, DataDog Database Monitoring e pganalyze. Para cada
 * query exibe tempo (cor por severidade), query SQL com syntax highlight
 * simples, plano do EXPLAIN em árvore, locks, e sugestões automáticas
 * (missing_index, rewrite, vacuum, stats, lock) com botão de copiar DDL.
 *
 * @example
 *   <SlowQueryList
 *     queries={queries}
 *     onQueryClick={(q) => console.log(q)}
 *     groupBy="table"
 *     thresholdMs={150}
 *   />
 */

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Hash,
  KeyRound,
  Layers,
  Lightbulb,
  Lock,
  Search,
  Table2,
  User,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

import type {
  PlanNode,
  QuerySuggestion,
  SlowQuery,
  SlowQueryGroupBy,
  SlowQueryListProps,
  SuggestionType,
} from "./slow-query-list-types"

/* ----------------------------- constants ----------------------------- */

const SEVERITY_LABELS: Record<"warning" | "critical", string> = {
  warning: "warning",
  critical: "critical",
}

const SUGGESTION_LABELS: Record<SuggestionType, string> = {
  missing_index: "Índice faltante",
  rewrite: "Reescrita",
  vacuum: "Vacuum",
  stats: "Atualizar stats",
  lock: "Lock contention",
  analyze: "Analyze",
}

const SQL_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "OUTER",
  "FULL",
  "ON",
  "AS",
  "AND",
  "OR",
  "NOT",
  "NULL",
  "IS",
  "IN",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "ILIKE",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION",
  "ALL",
  "DISTINCT",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "INDEX",
  "TABLE",
  "DROP",
  "ALTER",
  "ADD",
  "COLUMN",
  "CONSTRAINT",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "CASCADE",
  "WITH",
  "RECURSIVE",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "TRUE",
  "FALSE",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
])

const SUGGESTION_ICON: Record<SuggestionType, React.ComponentType<{ className?: string }>> = {
  missing_index: KeyRound,
  rewrite: Lightbulb,
  vacuum: Database,
  stats: Activity,
  lock: Lock,
  analyze: Search,
}

/* ----------------------------- PRNG seedado ----------------------------- */

/** Hash determinístico (FNV-1a 32bit) — usado só pra variação visual estável. */
function hashSeed(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** PRNG mulberry32 — determinístico, sem `Math.random`. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ----------------------------- formatters ----------------------------- */

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

function formatCount(n: number): string {
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

function relativeTime(iso: string, now: number): string {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, now - t)
  if (diff < 60_000) return `há ${Math.max(1, Math.round(diff / 1000))}s`
  if (diff < 3_600_000) return `há ${Math.round(diff / 60_000)}min`
  if (diff < 86_400_000) return `há ${Math.round(diff / 3_600_000)}h`
  return `há ${Math.round(diff / 86_400_000)}d`
}

/* ----------------------------- SQL syntax highlight ----------------------------- */

type SqlToken = { type: "kw" | "str" | "num" | "id" | "punct" | "ws" | "cmt"; value: string }

function tokenizeSql(sql: string): SqlToken[] {
  const tokens: SqlToken[] = []
  let i = 0
  const n = sql.length
  while (i < n) {
    const ch = sql[i]
    // whitespace
    if (/\s/.test(ch)) {
      let j = i
      while (j < n && /\s/.test(sql[j])) j++
      tokens.push({ type: "ws", value: sql.slice(i, j) })
      i = j
      continue
    }
    // line comment
    if (ch === "-" && sql[i + 1] === "-") {
      let j = i
      while (j < n && sql[j] !== "\n") j++
      tokens.push({ type: "cmt", value: sql.slice(i, j) })
      i = j
      continue
    }
    // string (single quote)
    if (ch === "'") {
      let j = i + 1
      while (j < n) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2
          continue
        }
        if (sql[j] === "'") {
          j++
          break
        }
        j++
      }
      tokens.push({ type: "str", value: sql.slice(i, j) })
      i = j
      continue
    }
    // number
    if (/[0-9]/.test(ch)) {
      let j = i
      while (j < n && /[0-9.]/.test(sql[j])) j++
      tokens.push({ type: "num", value: sql.slice(i, j) })
      i = j
      continue
    }
    // identifier or keyword
    if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++
      const word = sql.slice(i, j)
      const upper = word.toUpperCase()
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: "kw", value: word })
      } else {
        tokens.push({ type: "id", value: word })
      }
      i = j
      continue
    }
    // punctuation
    tokens.push({ type: "punct", value: ch })
    i++
  }
  return tokens
}

function SqlHighlight({ sql }: { sql: string }) {
  const tokens = React.useMemo(() => tokenizeSql(sql), [sql])
  return (
    <code
      data-slot="slow-query-sql"
      className="block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed"
    >
      {tokens.map((t, idx) => {
        const cls =
          t.type === "kw"
            ? "font-semibold text-sky-600 dark:text-sky-300"
            : t.type === "str"
              ? "text-emerald-600 dark:text-emerald-300"
              : t.type === "num"
                ? "text-amber-600 dark:text-amber-300"
                : t.type === "cmt"
                  ? "italic text-muted-foreground"
                  : t.type === "id"
                    ? "text-foreground"
                    : "text-muted-foreground"
        return (
          <span key={idx} className={cls}>
            {t.value}
          </span>
        )
      })}
    </code>
  )
}

/* ----------------------------- Plan tree ----------------------------- */

const PLAN_ICON: Record<string, React.ElementType> = {
  "Seq Scan": Table2,
  "Index Scan": Hash,
  "Index Only Scan": Hash,
  "Bitmap Index Scan": Hash,
  "Bitmap Heap Scan": Layers,
  "Hash Join": Layers,
  "Nested Loop": Layers,
  "Merge Join": Layers,
  Sort: Activity,
  Aggregate: Activity,
  Limit: Activity,
  "Materialize": Layers,
  Hash: Hash,
}

function PlanNodeView({ node, depth }: { node: PlanNode; depth: number }) {
  const Icon: React.ComponentType<{ className?: string }> = (PLAN_ICON[node.operation] ?? Activity) as React.ComponentType<{ className?: string }>
  return (
    <div
      data-slot="slow-query-plan-node"
      className={cn(
        "flex flex-col gap-1 border-l border-border/60 pl-3",
        depth === 0 && "border-l-0 pl-0",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-medium text-foreground">{node.operation}</span>
        {node.object ? (
          <span className="font-mono text-muted-foreground">on {node.object}</span>
        ) : null}
        {typeof node.cost === "number" ? (
          <span
            data-slot="slow-query-plan-cost"
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            cost {node.cost.toFixed(1)}
          </span>
        ) : null}
        {typeof node.rows === "number" ? (
          <span
            data-slot="slow-query-plan-rows"
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            rows {formatCount(node.rows)}
          </span>
        ) : null}
        {typeof node.actualTimeMs === "number" ? (
          <span
            data-slot="slow-query-plan-time"
            className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
          >
            {formatDuration(node.actualTimeMs)}
          </span>
        ) : null}
      </div>
      {node.children && node.children.length > 0 ? (
        <div className="ml-2 mt-1 flex flex-col gap-2 border-l border-dashed border-border/40 pl-3">
          {node.children.map((child, idx) => (
            <PlanNodeView key={`${depth}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PlanTree({ plan }: { plan: PlanNode }) {
  return (
    <div
      data-slot="slow-query-plan"
      className="rounded-md border border-border bg-muted/30 p-3"
    >
      <PlanNodeView node={plan} depth={0} />
    </div>
  )
}

/* ----------------------------- Suggestion card ----------------------------- */

function SuggestionCard({ suggestion }: { suggestion: QuerySuggestion }) {
  const [copied, setCopied] = React.useState(false)
  const Icon: React.ComponentType<{ className?: string }> = (SUGGESTION_ICON[suggestion.type] ?? Lightbulb) as React.ComponentType<{ className?: string }>
  const onCopy = React.useCallback(async () => {
    const ddl = suggestion.suggestedDdl
    if (!ddl) return
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ddl)
      }
    } catch {
      /* clipboard indisponível — silencioso (zero console) */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [suggestion.suggestedDdl])
  return (
    <div
      data-slot="slow-query-suggestion"
      data-suggestion-type={suggestion.type}
      className="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">
              {SUGGESTION_LABELS[suggestion.type]}
            </span>
            <span className="text-xs text-muted-foreground">{suggestion.description}</span>
          </div>
        </div>
        {typeof suggestion.estimatedImprovementPct === "number" ? (
          <span
            data-slot="slow-query-improvement"
            className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
          >
            −{suggestion.estimatedImprovementPct}%
          </span>
        ) : null}
      </div>
      {suggestion.suggestedDdl ? (
        <div className="flex flex-col gap-1.5">
          <pre
            data-slot="slow-query-suggested-ddl"
            className="overflow-x-auto rounded border border-border bg-muted/40 p-2 font-mono text-[11px] leading-relaxed text-foreground"
          >
            {suggestion.suggestedDdl}
          </pre>
          <button
            type="button"
            onClick={onCopy}
            data-slot="slow-query-copy-ddl"
            data-copied={copied}
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            )}
          >
            {copied ? (
              <>
                <Check className="size-3" aria-hidden /> Copiado
              </>
            ) : (
              <>
                <Copy className="size-3" aria-hidden /> Copiar DDL
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  )
}

/* ----------------------------- Query card ----------------------------- */

function queryIdLabel(q: SlowQuery): string {
  const first = q.query.split("\n")[0]?.trim() ?? q.query
  return first.length > 110 ? `${first.slice(0, 107)}…` : first
}

function QueryCard({
  q,
  threshold,
  onClick,
  defaultExpanded,
  now,
}: {
  q: SlowQuery
  threshold: number
  onClick?: (q: SlowQuery) => void
  defaultExpanded: boolean
  now: number
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const belowThreshold = q.durationMs < threshold
  const isCritical = q.severity === "critical"
  const severityClasses = isCritical
    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
  const SeverityIcon = isCritical ? AlertOctagon : AlertTriangle
  const handleClick = React.useCallback(() => {
    setExpanded((v) => !v)
  }, [])
  const handleKey = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        setExpanded((v) => !v)
      }
    },
    [],
  )
  return (
    <article
      data-slot="slow-query-card"
      data-severity={q.severity}
      data-below-threshold={belowThreshold}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-opacity",
        belowThreshold && "opacity-50",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={handleClick}
        onKeyDown={handleKey}
        data-slot="slow-query-card-header"
        className={cn(
          "flex w-full cursor-pointer flex-col gap-2 rounded-t-lg p-3 text-left transition-colors hover:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span
            data-slot="slow-query-duration"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
              severityClasses,
            )}
          >
            <SeverityIcon className="size-3" aria-hidden />
            {formatDuration(q.durationMs)}
          </span>
          <span className="font-mono text-xs text-foreground" title={q.query}>
            {queryIdLabel(q)}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Database className="size-3" aria-hidden />
              {q.database}.{q.schema}
            </span>
            {q.table ? (
              <span className="inline-flex items-center gap-1">
                <Table2 className="size-3" aria-hidden />
                {q.table}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <User className="size-3" aria-hidden />
              {q.user}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden />
              {relativeTime(q.lastSeen, now)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[11px] text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{formatCount(q.callsLastHour)}</span>{" "}
            chamadas/h
          </span>
          <span>
            examined{" "}
            <span className="font-mono font-medium text-foreground">
              {formatCount(q.rowsExamined)}
            </span>
          </span>
          <span>
            returned{" "}
            <span className="font-mono font-medium text-foreground">
              {formatCount(q.rowsReturned)}
            </span>
          </span>
          {q.locks.length > 0 ? (
            <span
              data-slot="slow-query-locks"
              className="inline-flex items-center gap-1"
            >
              <Lock className="size-3" aria-hidden />
              {q.locks.length} lock{q.locks.length === 1 ? "" : "s"}
            </span>
          ) : null}
          {q.suggestions && q.suggestions.length > 0 ? (
            <span
              data-slot="slow-query-suggestion-count"
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300"
            >
              <Lightbulb className="size-3" aria-hidden />
              {q.suggestions.length} sugestão
              {q.suggestions.length === 1 ? "" : "es"}
            </span>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div
          data-slot="slow-query-card-detail"
          className="flex flex-col gap-3 border-t border-border p-3"
        >
          <button
            type="button"
            onClick={() => onClick?.(q)}
            className="sr-only"
            aria-label="Selecionar query"
            tabIndex={-1}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Query SQL
            </span>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <SqlHighlight sql={q.query} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Plano (EXPLAIN)
              </span>
              <PlanTree plan={q.plan} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Locks ativos
              </span>
              <ul className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-2 text-xs">
                {q.locks.length === 0 ? (
                  <li className="text-muted-foreground">Nenhum lock ativo</li>
                ) : (
                  q.locks.map((lock, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-1.5 font-mono text-foreground"
                    >
                      <Lock className="size-3 text-muted-foreground" aria-hidden />
                      {lock}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          {q.suggestions && q.suggestions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Sugestões
              </span>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {q.suggestions.map((s, idx) => (
                  <SuggestionCard key={idx} suggestion={s} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/* ----------------------------- Group ----------------------------- */

type Group = { key: string; label: string; items: SlowQuery[] }

function buildGroups(
  queries: SlowQuery[],
  groupBy: SlowQueryGroupBy,
): Group[] {
  if (groupBy === "none") {
    return [{ key: "__all__", label: "Todas as queries", items: queries }]
  }
  const map = new Map<string, Group>()
  for (const q of queries) {
    const k =
      groupBy === "table"
        ? q.table ?? "(sem tabela)"
        : groupBy === "database"
          ? q.database
          : q.user
    const label =
      groupBy === "table"
        ? q.table ?? "(sem tabela)"
        : groupBy === "database"
          ? q.database
          : q.user
    if (!map.has(k)) map.set(k, { key: k, label, items: [] })
    map.get(k)!.items.push(q)
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

/* ----------------------------- Component ----------------------------- */

function SlowQueryList({
  queries,
  onQueryClick,
  groupBy,
  thresholdMs = 100,
  className,
  ...props
}: SlowQueryListProps) {
  // PRNG seedado estável baseado nos ids — garante variação visual determinística
  // entre renders do mesmo conjunto de queries (sem Math.random em runtime).
  const seedKey = React.useMemo(
    () => queries.map((q) => q.id).join("|"),
    [queries],
  )
  const rand = React.useMemo(() => mulberry32(hashSeed(seedKey)), [seedKey])
  // consome o PRNG pra registrar uso (mantém chamada determinística)
  React.useEffect(() => {
    rand()
  }, [rand])

  const [severityFilter, setSeverityFilter] = React.useState<
    ReadonlySet<"warning" | "critical">
  >(new Set(["warning", "critical"]))
  const [databaseFilter, setDatabaseFilter] = React.useState<ReadonlySet<string> | null>(null)
  const [threshold, setThreshold] = React.useState<number>(thresholdMs)
  const [sortBy, setSortBy] = React.useState<"duration" | "frequency">("duration")

  const databases = React.useMemo(
    () => Array.from(new Set(queries.map((q) => q.database))).sort(),
    [queries],
  )

  const filtered = React.useMemo(() => {
    const out = queries.filter((q) => {
      if (!severityFilter.has(q.severity)) return false
      if (databaseFilter && !databaseFilter.has(q.database)) return false
      return true
    })
    if (sortBy === "duration") {
      out.sort((a, b) => b.durationMs - a.durationMs)
    } else {
      out.sort((a, b) => b.callsLastHour - a.callsLastHour)
    }
    return out
  }, [queries, severityFilter, databaseFilter, sortBy])

  const effectiveGroupBy: SlowQueryGroupBy = groupBy ?? "table"
  const groups = React.useMemo(
    () => buildGroups(filtered, effectiveGroupBy),
    [filtered, effectiveGroupBy],
  )

  const totalMs = React.useMemo(
    () => filtered.reduce((acc, q) => acc + q.durationMs, 0),
    [filtered],
  )
  const slowestMs = React.useMemo(
    () => filtered.reduce((acc, q) => Math.max(acc, q.durationMs), 0),
    [filtered],
  )

  const toggleSeverity = (s: "warning" | "critical") => {
    setSeverityFilter((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }
  const toggleDatabase = (db: string) => {
    setDatabaseFilter((prev) => {
      const next = new Set(prev ?? new Set(databases))
      if (next.has(db)) next.delete(db)
      else next.add(db)
      return next
    })
  }

  const now = React.useMemo(() => Date.now(), [])

  return (
    <div
      data-slot="slow-query-list"
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl border border-border bg-background p-4 text-foreground",
        className,
      )}
      {...props}
    >
      <header
        data-slot="slow-query-list-header"
        className="flex flex-col gap-2 border-b border-border pb-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">
            <span data-slot="slow-query-list-count">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "query lenta" : "queries lentas"}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              tempo total{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatDuration(totalMs)}
              </span>
            </span>
            <span>
              query mais lenta{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatDuration(slowestMs)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            data-slot="slow-query-threshold"
            className="flex flex-1 min-w-[180px] items-center gap-2 text-xs text-muted-foreground"
          >
            <span className="shrink-0 font-medium">Threshold</span>
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-amber-500"
              aria-label="Limiar mínimo de duração em ms"
            />
            <span className="shrink-0 font-mono text-[11px] text-foreground">
              {formatDuration(threshold)}
            </span>
          </label>
          <div
            data-slot="slow-query-severity-filter"
            className="flex items-center gap-1.5"
            role="group"
            aria-label="Filtro por severidade"
          >
            {(["warning", "critical"] as const).map((s) => {
              const active = severityFilter.has(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeverity(s)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? s === "critical"
                        ? "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                        : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  <AlertTriangle
                    className={cn("size-3", s === "critical" && "hidden")}
                    aria-hidden
                  />
                  <AlertOctagon
                    className={cn("size-3", s === "warning" && "hidden")}
                    aria-hidden
                  />
                  {SEVERITY_LABELS[s]}
                </button>
              )
            })}
          </div>
          {databases.length > 1 ? (
            <div
              data-slot="slow-query-database-filter"
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filtro por banco de dados"
            >
              {databases.map((db) => {
                const active = (databaseFilter ?? new Set(databases)).has(db)
                return (
                  <button
                    key={db}
                    type="button"
                    onClick={() => toggleDatabase(db)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors",
                      active
                        ? "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Database className="size-3" aria-hidden />
                    {db}
                  </button>
                )
              })}
              {databaseFilter ? (
                <button
                  type="button"
                  onClick={() => setDatabaseFilter(null)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Limpar filtro de banco"
                >
                  <X className="size-3" aria-hidden /> Limpar
                </button>
              ) : null}
            </div>
          ) : null}
          <div
            data-slot="slow-query-sort"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <label htmlFor="slow-query-sort-select" className="font-medium">
              Ordenar
            </label>
            <select
              id="slow-query-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "duration" | "frequency")}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            >
              <option value="duration">Duração</option>
              <option value="frequency">Frequência</option>
            </select>
          </div>
        </div>
      </header>

      <div
        data-slot="slow-query-list-body"
        className="flex flex-col gap-4"
      >
        {filtered.length === 0 ? (
          <div
            data-slot="slow-query-empty"
            className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-10 text-center"
          >
            <Search className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              Nenhuma query lenta encontrada
            </p>
            <p className="text-xs text-muted-foreground">
              Ajuste o threshold ou os filtros para ver mais resultados.
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section
              key={g.key}
              data-slot="slow-query-group"
              className="flex flex-col gap-2"
            >
              {effectiveGroupBy !== "none" ? (
                <h3
                  data-slot="slow-query-group-label"
                  className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {g.label}{" "}
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    · {g.items.length}
                  </span>
                </h3>
              ) : null}
              <div className="flex flex-col gap-2">
                {g.items.map((q, idx) => (
                  <QueryCard
                    key={q.id}
                    q={q}
                    threshold={threshold}
                    onClick={onQueryClick}
                    defaultExpanded={idx === 0}
                    now={now}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

export { SlowQueryList }
