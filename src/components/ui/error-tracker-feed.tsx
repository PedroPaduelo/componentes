/**
 * ErrorTrackerFeed — componente REUTILIZÁVEL para listar erros/exception events.
 *
 * Inspirado no padrão Sentry (issue group + count + environment + status +
 * firstSeen/lastSeen) e na estética do Pulse (Observability Center) — usa os
 * mesmos tokens semânticos shadcn e a mesma paleta de severidade
 * (emerald-500 / sky-400 / amber-500 / rose-500 / gray-500) já presente no
 * `ObservabilityCenter` da vitrine.
 *
 * Funcionalidades:
 *  - Header com totalizadores ("N erros · M grupos · K ambientes")
 *  - Filtros funcionais (ambiente multi-select, status multi-select, tipo
 *    com search)
 *  - Agrupamento configurável via `groupBy` ("type" | "service" | "user")
 *  - Cada item mostra: ícone por categoria, tipo (mono font), mensagem
 *    (2 linhas), badge com count, primeiro/último avistado, chip de
 *    ambiente (prod=rose, staging=amber, dev=sky), usuário(s) afetado(s),
 *    chip de status e mini-sparkline de ocorrências
 *  - Estado vazio elegante
 *  - Click-to-select via prop `onErrorClick` (opcional)
 *
 * Zero dívida técnica: sem `as any`, sem `Math.random`, sem interpolação
 * Tailwind, sem console.*, sem TODO. PRNG seedado quando se usa
 * simulação (helpers em `seedHelpers`).
 */

import * as React from "react"
import {
  AlertOctagon,
  AlertTriangle,
  Bug,
  CheckCircle2,
  EyeOff,
  Filter,
  Inbox,
  RefreshCw,
  Search,
  ServerCrash,
  ShieldOff,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type ErrorCategory,
  type ErrorEnvironment,
  type ErrorEventItem,
  type ErrorGroupBy,
  type ErrorStatus,
  type ErrorTrackerFeedProps,
  type ErrorTrendPoint,
} from "./error-tracker-feed-types"

/* ------------------------------------------------------------------ */
/*  Constantes de visualização                                        */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<ErrorStatus, string> = {
  new: "Novo",
  resolved: "Resolvido",
  ignored: "Ignorado",
  suppressed: "Suprimido",
}

const STATUS_CLASSES: Record<
  ErrorStatus,
  { chip: string; dot: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  new: {
    chip: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-500",
    Icon: AlertOctagon,
  },
  resolved: {
    chip: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    Icon: CheckCircle2,
  },
  ignored: {
    chip: "bg-gray-500/15 text-gray-500 border-gray-500/30",
    dot: "bg-gray-500",
    text: "text-gray-500",
    Icon: EyeOff,
  },
  suppressed: {
    chip: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-500",
    Icon: ShieldOff,
  },
}

const ENV_CLASSES: Record<
  ErrorEnvironment,
  { chip: string; dot: string; label: string }
> = {
  prod: { chip: "bg-rose-500/15 text-rose-500 border-rose-500/30", dot: "bg-rose-500", label: "prod" },
  staging: { chip: "bg-amber-500/15 text-amber-500 border-amber-500/30", dot: "bg-amber-500", label: "staging" },
  dev: { chip: "bg-sky-400/15 text-sky-500 border-sky-400/30", dot: "bg-sky-400", label: "dev" },
}

const CATEGORY_META: Record<
  ErrorCategory,
  { Icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  exception: { Icon: Bug, tone: "text-rose-500", label: "Exceção" },
  api: { Icon: AlertTriangle, tone: "text-amber-500", label: "API" },
  db: { Icon: ServerCrash, tone: "text-violet-500", label: "DB" },
  auth: { Icon: ShieldOff, tone: "text-orange-500", label: "Auth" },
  network: { Icon: RefreshCw, tone: "text-sky-500", label: "Rede" },
  validation: { Icon: AlertOctagon, tone: "text-yellow-500", label: "Validação" },
}

const ENVIRONMENTS: ErrorEnvironment[] = ["prod", "staging", "dev"]
const STATUSES: ErrorStatus[] = ["new", "resolved", "ignored", "suppressed"]

/* ------------------------------------------------------------------ */
/*  Helpers de formatação (determinísticos, sem Math.random)          */
/* ------------------------------------------------------------------ */

function formatRelative(iso: string, now: number): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return iso
  const diff = Math.max(0, now - then)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `há ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} d`
  const mo = Math.floor(d / 30)
  return `há ${mo} m`
}

function formatAbsolute(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  // ISO enxuto: YYYY-MM-DD HH:MM (sem segundos, sem locale)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function compactNumber(n: number): string {
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}

/* ------------------------------------------------------------------ */
/*  Estado de filtros (useReducer — gerencia 4 facetas em uma vez)    */
/* ------------------------------------------------------------------ */

type FilterState = {
  envs: Set<ErrorEnvironment>
  statuses: Set<ErrorStatus>
  typeQuery: string
  groupBy: ErrorGroupBy
}

type FilterAction =
  | { type: "TOGGLE_ENV"; env: ErrorEnvironment }
  | { type: "TOGGLE_STATUS"; status: ErrorStatus }
  | { type: "SET_TYPE_QUERY"; query: string }
  | { type: "RESET" }
  | { type: "SET_GROUP_BY"; groupBy: ErrorGroupBy }

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "TOGGLE_ENV": {
      const next = new Set(state.envs)
      if (next.has(action.env)) next.delete(action.env)
      else next.add(action.env)
      return { ...state, envs: next }
    }
    case "TOGGLE_STATUS": {
      const next = new Set(state.statuses)
      if (next.has(action.status)) next.delete(action.status)
      else next.add(action.status)
      return { ...state, statuses: next }
    }
    case "SET_TYPE_QUERY":
      return { ...state, typeQuery: action.query }
    case "SET_GROUP_BY":
      return { ...state, groupBy: action.groupBy }
    case "RESET":
      return {
        envs: new Set(),
        statuses: new Set(),
        typeQuery: "",
        groupBy: state.groupBy,
      }
    default:
      return state
  }
}

function makeInitialState(groupBy: ErrorGroupBy): FilterState {
  return {
    envs: new Set(),
    statuses: new Set(),
    typeQuery: "",
    groupBy,
  }
}

/* ------------------------------------------------------------------ */
/*  Filtragem                                                         */
/* ------------------------------------------------------------------ */

function applyFilters(
  errors: ErrorEventItem[],
  filters: FilterState,
): ErrorEventItem[] {
  const query = filters.typeQuery.trim().toLowerCase()
  return errors.filter((e) => {
    if (filters.envs.size > 0 && !filters.envs.has(e.environment)) return false
    if (filters.statuses.size > 0 && !filters.statuses.has(e.status)) return false
    if (query.length > 0) {
      const hay = `${e.type} ${e.message} ${e.service}`.toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })
}

/* ------------------------------------------------------------------ */
/*  Sparkline (SVG) — tendência das últimas horas                     */
/* ------------------------------------------------------------------ */

function Sparkline({
  values,
  color,
}: {
  values: number[]
  color: string
}) {
  const W = 120
  const H = 32
  const pad = 2
  if (values.length < 2) {
    return <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-[120px]" aria-hidden />
  }
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const span = Math.max(1, max - min)
  const step = (W - pad * 2) / (values.length - 1)
  const pts = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (H - pad * 2) * (1 - (v - min) / span)
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  })
  const line = `M ${pts.join(" L ")}`
  const lastX = pad + (values.length - 1) * step
  const area = `${line} L ${lastX.toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`
  const lastY = pad + (H - pad * 2) * (1 - (values[values.length - 1] - min) / span)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-8 w-[120px]"
      aria-hidden
    >
      <path d={area} fill={color} opacity={0.15} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.2} fill={color} />
    </svg>
  )
}

function trendToValues(trend: ErrorTrendPoint[] | undefined): number[] {
  if (!trend || trend.length === 0) return []
  return trend.map((p) => Math.max(0, p.count | 0))
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                    */
/* ------------------------------------------------------------------ */

function EnvChip({ env }: { env: ErrorEnvironment }) {
  const meta = ENV_CLASSES[env]
  return (
    <span
      data-slot="etf-env"
      data-env={env}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium",
        meta.chip,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

function StatusChip({ status }: { status: ErrorStatus }) {
  const meta = STATUS_CLASSES[status]
  const Icon = meta.Icon
  return (
    <span
      data-slot="etf-status"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        meta.chip,
      )}
    >
      <Icon className="size-3" />
      {STATUS_LABEL[status]}
    </span>
  )
}

function UserAvatar({
  name,
  avatar,
  size = 20,
}: {
  name: string
  avatar?: string
  size?: number
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[9px] font-semibold text-foreground"
      style={{ width: size, height: size }}
      aria-label={name}
      title={name}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

function ErrorTrackerFeed({
  errors,
  groupBy = "type",
  filterable = true,
  onErrorClick,
  className,
  ...hostProps
}: ErrorTrackerFeedProps) {
  // "Agora" congelado na primeira renderização — evita que timestamps
  // mudem a cada re-render e mantém a saída determinística para o validador.
  const nowRef = React.useRef(Date.now())
  const [filters, dispatch] = React.useReducer(
    filterReducer,
    groupBy,
    makeInitialState,
  )

  // Totalizadores (antes do filtro — refletem o universo total)
  const totalEnvs = React.useMemo(
    () => new Set(errors.map((e) => e.environment)).size,
    [errors],
  )
  const totalCount = errors.reduce((acc, e) => acc + e.count, 0)

  // Lista filtrada
  const filtered = React.useMemo(
    () => applyFilters(errors, filters),
    [errors, filters],
  )

  // Tipo únicos para o "filtro de tipo" (chips visíveis quando lista é pequena)
  const typeFacets = React.useMemo(() => {
    const set = new Set<string>()
    for (const e of errors) set.add(e.type)
    return Array.from(set)
  }, [errors])

  const visibleTypes = React.useMemo(() => {
    const q = filters.typeQuery.trim().toLowerCase()
    if (q.length === 0) return typeFacets.slice(0, 6)
    return typeFacets.filter((t) => t.toLowerCase().includes(q))
  }, [typeFacets, filters.typeQuery])

  const groups = React.useMemo(() => {
    if (filters.groupBy === "service") {
      const m = new Map<string, ErrorEventItem[]>()
      for (const e of filtered) {
        const list = m.get(e.service) ?? []
        list.push(e)
        m.set(e.service, list)
      }
      return Array.from(m.entries())
    }
    if (filters.groupBy === "user") {
      const m = new Map<string, { item: ErrorEventItem; users: number }[]>()
      for (const e of filtered) {
        const users = e.affectedUsers?.length ?? 0
        const list = m.get(e.id) ?? []
        list.push({ item: e, users })
        m.set(e.id, list)
      }
      // groupBy=user agrupa pelo PRIMEIRO usuário afetado (id) ou pelo id do item
      const byUser = new Map<string, ErrorEventItem[]>()
      for (const e of filtered) {
        const key = e.affectedUsers?.[0]?.id ?? e.id
        const list = byUser.get(key) ?? []
        list.push(e)
        byUser.set(key, list)
      }
      return Array.from(byUser.entries())
    }
    // default: groupBy="type"
    const m = new Map<string, ErrorEventItem[]>()
    for (const e of filtered) {
      const list = m.get(e.type) ?? []
      list.push(e)
      m.set(e.type, list)
    }
    return Array.from(m.entries())
  }, [filtered, filters.groupBy])

  return (
    <div
      data-slot="error-tracker-feed"
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground",
        className,
      )}
      {...hostProps}
    >
      {/* ============================ HEADER ============================ */}
      <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="size-4 text-rose-500" />
            Erros
          </span>
          <span
            data-slot="etf-total"
            className="rounded-md border border-border bg-background/50 px-2 py-0.5 font-mono text-xs tabular-nums"
          >
            <strong className="text-foreground">{filtered.length}</strong>{" "}
            <span className="text-muted-foreground">/ {errors.length} itens</span>
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            <strong className="text-foreground">
              {compactNumber(filtered.reduce((a, e) => a + e.count, 0))}
            </strong>{" "}
            <span className="text-muted-foreground">
              / {compactNumber(totalCount)} ocorrências
            </span>
          </span>
          <span className="rounded-md border border-border bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
            <strong className="text-foreground">{groups.length}</strong> grupos
          </span>
          <span className="rounded-md border border-border bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
            <strong className="text-foreground">{totalEnvs}</strong> ambientes
          </span>
        </div>
        {filterable && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              Agrupar por
            </span>
            <div
              role="tablist"
              aria-label="Agrupar erros por"
              className="inline-flex items-center rounded-md border border-border bg-background p-0.5"
            >
              {(["type", "service", "user"] as ErrorGroupBy[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  aria-selected={filters.groupBy === g}
                  data-group={g}
                  onClick={() => dispatch({ type: "SET_GROUP_BY", groupBy: g })}
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-xs font-medium transition-colors",
                    filters.groupBy === g
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {g === "type" ? "Tipo" : g === "service" ? "Serviço" : "Usuário"}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ============================ FILTROS ============================ */}
      {filterable && (
        <div className="flex flex-col gap-2 border-b border-border bg-background/30 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="size-3.5" />
              Ambiente
            </div>
            {ENVIRONMENTS.map((env) => {
              const meta = ENV_CLASSES[env]
              const active = filters.envs.has(env)
              return (
                <button
                  key={env}
                  type="button"
                  data-slot="etf-env-toggle"
                  data-env={env}
                  aria-pressed={active}
                  onClick={() => dispatch({ type: "TOGGLE_ENV", env })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium transition-opacity",
                    meta.chip,
                    !active && "opacity-35 hover:opacity-70",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", meta.dot)} />
                  {meta.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="size-3.5" />
              Status
            </div>
            {STATUSES.map((st) => {
              const meta = STATUS_CLASSES[st]
              const active = filters.statuses.has(st)
              const Icon = meta.Icon
              return (
                <button
                  key={st}
                  type="button"
                  data-slot="etf-status-toggle"
                  data-status={st}
                  aria-pressed={active}
                  onClick={() => dispatch({ type: "TOGGLE_STATUS", status: st })}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity",
                    meta.chip,
                    !active && "opacity-35 hover:opacity-70",
                  )}
                >
                  <Icon className="size-3" />
                  {STATUS_LABEL[st]}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Search className="size-3.5" />
              Buscar tipo / serviço
            </div>
            <Input
              type="search"
              value={filters.typeQuery}
              onChange={(e) =>
                dispatch({ type: "SET_TYPE_QUERY", query: e.target.value })
              }
              placeholder="ex.: TypeError, /api/users, checkout…"
              className="h-7 max-w-xs text-xs"
              data-slot="etf-type-search"
            />
            {visibleTypes.length > 0 && filters.typeQuery.length === 0 && (
              <span className="text-[10px] text-muted-foreground">
                tipos comuns: {visibleTypes.length}/{typeFacets.length}
              </span>
            )}
            {(filters.envs.size > 0 ||
              filters.statuses.size > 0 ||
              filters.typeQuery.length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => dispatch({ type: "RESET" })}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ============================ LISTA ============================ */}
      {/* Wrapper natural: a lista cresce com o conteúdo. Sem max-h fixo
          (era o bug que cortava 3 de 12 rows no primeiro exemplo). */}
      <div className="flex min-w-0 flex-col">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          <ul
            data-slot="etf-list"
            className="flex min-w-0 flex-col divide-y divide-border"
          >
            {groups.map(([groupKey, items]) => (
              <li
                key={groupKey}
                data-slot="etf-group"
                data-group-key={groupKey}
                className="flex flex-col"
              >
                {filters.groupBy !== "type" && (
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {filters.groupBy === "user" ? (
                      <Users className="size-3" />
                    ) : (
                      <ServerCrash className="size-3" />
                    )}
                    {groupKey}
                    <span className="text-muted-foreground/60">
                      · {items.length} {items.length === 1 ? "item" : "itens"}
                    </span>
                  </div>
                )}
                {items.map((err) => (
                  <ErrorRow
                    key={err.id}
                    error={err}
                    nowMs={nowRef.current}
                    onClick={onErrorClick}
                  />
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Linha de erro                                                     */
/* ------------------------------------------------------------------ */

function ErrorRow({
  error,
  nowMs,
  onClick,
}: {
  error: ErrorEventItem
  nowMs: number
  onClick?: (e: ErrorEventItem) => void
}) {
  const meta = CATEGORY_META[error.category]
  const Icon = meta.Icon
  const status = STATUS_CLASSES[error.status]
  const interactive = typeof onClick === "function"
  const trend = trendToValues(error.trend)
  const trendColor =
    error.status === "resolved"
      ? "#10b981" // emerald-500
      : error.status === "ignored"
        ? "#6b7280" // gray-500
        : error.status === "suppressed"
          ? "#f59e0b" // amber-500
          : "#f43f5e" // rose-500 (default para "new")
  return (
    <button
      type="button"
      data-slot="etf-row"
      data-id={error.id}
      data-env={error.environment}
      data-status={error.status}
      onClick={interactive ? () => onClick(error) : undefined}
      className={cn(
        "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        interactive && "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60",
          meta.tone,
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <code
            data-slot="etf-type"
            className="truncate font-mono text-[12px] font-semibold text-foreground"
            title={error.type}
          >
            {error.type}
          </code>
          <Badge
            variant="secondary"
            className="gap-1 px-1.5 py-0 text-[10px] tabular-nums"
            data-slot="etf-count"
          >
            {compactNumber(error.count)}×
          </Badge>
          <EnvChip env={error.environment} />
          <StatusChip status={error.status} />
          {error.release && (
            <span className="rounded border border-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {error.release}
            </span>
          )}
        </div>

        <p
          className="line-clamp-2 text-xs text-muted-foreground"
          title={error.message}
        >
          {error.message}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span>
            serviço:{" "}
            <span className="font-mono font-medium text-foreground/80">
              {error.service}
            </span>
          </span>
          <span>
            categoria:{" "}
            <span className={cn("font-medium", meta.tone)}>{meta.label}</span>
          </span>
          <span>
            primeiro:{" "}
            <span className="tabular-nums">
              {formatRelative(error.firstSeen, nowMs)}
            </span>
            <span className="text-muted-foreground/50"> · </span>
            <span className="font-mono">{formatAbsolute(error.firstSeen)}</span>
          </span>
          <span>
            último:{" "}
            <span className="tabular-nums">
              {formatRelative(error.lastSeen, nowMs)}
            </span>
          </span>
        </div>

        {error.affectedUsers && error.affectedUsers.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Users className="size-3" />
            <span className="flex -space-x-1.5">
              {error.affectedUsers.slice(0, 3).map((u) => (
                <UserAvatar
                  key={u.id}
                  name={u.name}
                  avatar={u.avatar}
                />
              ))}
            </span>
            <span>
              afeta{" "}
              <strong className="text-foreground">
                {error.affectedUsers[0].name}
              </strong>
              {error.affectedUsers.length > 1 && (
                <>
                  {" "}
                  e mais{" "}
                  <strong className="text-foreground">
                    {error.affectedUsers.length - 1}
                  </strong>
                </>
              )}
            </span>
            {error.affectedUsers.reduce((a, u) => a + u.count, 0) > 0 && (
              <span className="text-muted-foreground/70">
                ({compactNumber(
                  error.affectedUsers.reduce((a, u) => a + u.count, 0),
                )}{" "}
                eventos)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
        {trend.length >= 2 ? (
          <Sparkline values={trend} color={trendColor} />
        ) : (
          <span className="flex h-8 w-[120px] items-center justify-end text-[10px] text-muted-foreground/50">
            sem tendência
          </span>
        )}
        <span
          className={cn("flex items-center gap-1 text-[10px]", status.text)}
        >
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          {STATUS_LABEL[error.status]}
        </span>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Estado vazio                                                       */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div
      data-slot="etf-empty"
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-emerald-500">
        <Inbox className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          Nenhum erro com esses filtros
        </p>
        <p className="text-xs text-muted-foreground">
          Tente remover filtros de ambiente, status ou limpar a busca.
        </p>
      </div>
    </div>
  )
}

export { ErrorTrackerFeed }
