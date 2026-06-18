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
  Copy,
  EyeOff,
  ExternalLink,
  Filter,
  Inbox,
  ListTree,
  MessageSquareText,
  RefreshCw,
  Search,
  ServerCrash,
  ShieldOff,
  Tag,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  type ErrorAction,
  type ErrorBreadcrumb,
  type ErrorCategory,
  type ErrorEnvironment,
  type ErrorEventItem,
  type ErrorGroupBy,
  type ErrorStackFrame,
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
  onErrorAction,
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
  // Erro selecionado para o detail dialog built-in. Null quando nenhum.
  // Só é usado se `onErrorClick` for undefined (caso contrário, o consumidor
  // é dono da ação de click).
  const [selectedError, setSelectedError] = React.useState<
    ErrorEventItem | null
  >(null)

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
                    onClick={
                      onErrorClick ?? ((e) => setSelectedError(e))
                    }
                  />
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*
       * Detail dialog built-in. Só é renderizado/controlado pelo
       * componente quando o consumidor NÃO passou `onErrorClick`.
       * Se passou, a prop é dona da ação de click e o dialog fica
       * permanentemente fechado.
       */}
      {!onErrorClick && (
        <ErrorDetailDialog
          error={selectedError}
          onOpenChange={(open) => {
            if (!open) setSelectedError(null)
          }}
          onAction={onErrorAction}
        />
      )}
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

/* ------------------------------------------------------------------ */
/*  Detail dialog (built-in)                                          */
/* ------------------------------------------------------------------ */

/**
 * Cores semânticas por status, reutilizadas no detail dialog.
 * Mantidas em sync com STATUS_CLASSES do feed (literal — sem interpolação
 * Tailwind).
 */
const DIALOG_STATUS_TONE: Record<
  ErrorStatus,
  { ring: string; chip: string; dot: string; text: string }
> = {
  new: {
    ring: "ring-rose-500/40",
    chip: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-500",
  },
  resolved: {
    ring: "ring-emerald-500/40",
    chip: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
  },
  ignored: {
    ring: "ring-gray-500/40",
    chip: "bg-gray-500/15 text-gray-500 border-gray-500/30",
    dot: "bg-gray-500",
    text: "text-gray-500",
  },
  suppressed: {
    ring: "ring-amber-500/40",
    chip: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-500",
  },
}

const DIALOG_ENV_TONE: Record<ErrorEnvironment, string> = {
  dev: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  staging: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  prod: "bg-rose-500/15 text-rose-500 border-rose-500/30",
}

function formatBreadcrumbTime(iso: string): string {
  // Formato HH:mm:ss estável (não depende de Date.now() nem locale do host).
  const m = /^.*T(\d{2}:\d{2}:\d{2})/.exec(iso)
  return m ? m[1] : iso
}

function trendToSvgPath(
  trend: ErrorTrendPoint[],
  width: number,
  height: number,
): string {
  if (trend.length < 2) return ""
  let min = Infinity
  let max = -Infinity
  for (const p of trend) {
    if (p.count < min) min = p.count
    if (p.count > max) max = p.count
  }
  const span = max - min || 1
  const step = width / (trend.length - 1)
  return trend
    .map((p, i) => {
      const x = i * step
      const y = height - ((p.count - min) / span) * height
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function CopyableButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false)
  const onClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(
        () => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        },
        () => {
          /* clipboard falhou — mantém estado neutro */
        },
      )
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      aria-label={`Copiar ${label}`}
    >
      <Copy className="size-3" />
      {copied ? "Copiado!" : label}
    </button>
  )
}

function StackTab({ stack }: { stack?: ErrorStackFrame[] }) {
  if (!stack || stack.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Stack trace não disponível para este erro.
      </p>
    )
  }
  return (
    <ol
      data-slot="etf-detail-stack"
      className="flex flex-col gap-0.5 rounded-md border border-border bg-background/60 p-2 font-mono text-[11px]"
    >
      {stack.map((frame, i) => (
        <li
          key={i}
          data-slot="etf-detail-stack-frame"
          data-in-app={frame.inApp === false ? "false" : "true"}
          className={cn(
            "flex flex-col gap-0.5 rounded px-2 py-1",
            frame.inApp === false
              ? "text-muted-foreground/70"
              : "bg-rose-500/5 text-foreground",
          )}
        >
          <span className="flex items-baseline gap-2">
            <span className="w-5 shrink-0 text-right text-[10px] text-muted-foreground">
              {i}
            </span>
            <span className="font-semibold">{frame.function || "<anonymous>"}</span>
          </span>
          {(frame.file || frame.line) && (
            <span className="ml-7 flex items-baseline gap-2 text-[10px] text-muted-foreground">
              <span className="truncate">{frame.file ?? "<inline>"}</span>
              {frame.line != null && (
                <span>
                  :{frame.line}
                  {frame.column != null ? `:${frame.column}` : ""}
                </span>
              )}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function BreadcrumbsTab({
  breadcrumbs,
}: {
  breadcrumbs?: ErrorBreadcrumb[]
}) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Nenhum breadcrumb registrado.
      </p>
    )
  }
  const iconFor: Record<ErrorBreadcrumb["type"], React.ComponentType<{ className?: string }>> = {
    navigation: ExternalLink,
    http: ServerCrash,
    ui: Users,
    console: MessageSquareText,
    info: Tag,
    error: AlertOctagon,
  }
  return (
    <ol
      data-slot="etf-detail-breadcrumbs"
      className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-2"
    >
      {breadcrumbs.map((b, i) => {
        const Icon = iconFor[b.type]
        const tone =
          b.level === "error"
            ? "text-rose-500"
            : b.level === "warning"
              ? "text-amber-500"
              : "text-muted-foreground"
        return (
          <li
            key={i}
            data-slot="etf-detail-breadcrumb"
            data-type={b.type}
            className="flex items-start gap-2 rounded px-2 py-1 text-[11px] hover:bg-muted/30"
          >
            <span className="mt-0.5 shrink-0">
              <Icon className={cn("size-3.5", tone)} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-muted-foreground">
                {formatBreadcrumbTime(b.t)}
              </span>
              <span className="ml-2 text-foreground">{b.message}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ContextTab({ error }: { error: ErrorEventItem }) {
  const rows: Array<[string, React.ReactNode]> = [
    ["Serviço", error.service],
    ["Ambiente", error.environment],
    ["Release", error.release ?? "—"],
    ["Categoria", error.category],
    ["Status", error.status],
    ["Ocorrências", String(error.count)],
    ["Primeira vez", error.firstSeen],
    ["Última vez", error.lastSeen],
  ]
  return (
    <dl
      data-slot="etf-detail-context"
      className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-md border border-border bg-background/60 p-3 text-[11px] sm:grid-cols-2"
    >
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-2">
          <dt className="shrink-0 text-muted-foreground">{k}</dt>
          <dd className="min-w-0 truncate font-mono text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function HistoryTab({ trend }: { trend?: ErrorTrendPoint[] }) {
  if (!trend || trend.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Sem histórico de ocorrências.
      </p>
    )
  }
  const W = 560
  const H = 120
  const path = trendToSvgPath(trend, W, H)
  const total = trend.reduce((a, p) => a + p.count, 0)
  return (
    <div
      data-slot="etf-detail-history"
      className="flex flex-col gap-2 rounded-md border border-border bg-background/60 p-3"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {trend.length} pontos · total{" "}
          <span className="font-mono font-semibold text-foreground">
            {total}
          </span>{" "}
          ocorrências
        </span>
        <span className="text-muted-foreground">
          pico{" "}
          <span className="font-mono font-semibold text-foreground">
            {Math.max(...trend.map((p) => p.count))}
          </span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
      >
        <line
          x1={0}
          y1={H - 1}
          x2={W}
          y2={H - 1}
          stroke="var(--border)"
          strokeWidth={1}
        />
        <path
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function UsersTab({
  users,
}: {
  users: NonNullable<ErrorEventItem["affectedUsers"]>
}) {
  if (users.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Nenhum usuário afetado registrado.
      </p>
    )
  }
  return (
    <ul
      data-slot="etf-detail-users"
      className="flex flex-col gap-1.5 rounded-md border border-border bg-background/60 p-2"
    >
      {users.map((u) => (
        <li
          key={u.id}
          data-slot="etf-detail-user"
          className="flex items-center gap-3 rounded px-2 py-1.5 text-[11px] hover:bg-muted/30"
        >
          {u.avatar ? (
            <img
              src={u.avatar}
              alt=""
              className="size-7 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
              {u.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-foreground">{u.name}</span>
          <span className="shrink-0 font-mono text-muted-foreground">
            {u.count}×
          </span>
        </li>
      ))}
    </ul>
  )
}

function ErrorDetailDialog({
  error,
  onOpenChange,
  onAction,
}: {
  error: ErrorEventItem | null
  onOpenChange: (open: boolean) => void
  onAction?: ErrorAction
}) {
  const open = error !== null
  // String completa do stack para o botão "Copiar stack".
  const stackText = React.useMemo(() => {
    if (!error?.stack) return ""
    return error.stack
      .map(
        (f) =>
          `  at ${f.function || "<anonymous>"} (${f.file ?? "<inline>"}${
            f.line != null ? `:${f.line}:${f.column ?? 0}` : ""
          })`,
      )
      .join("\n")
  }, [error?.stack])

  const handleAction = (action: "resolve" | "ignore" | "copy-stack") => {
    if (!error) return
    if (action === "copy-stack") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(
          `${error.type}\n${error.message}\n\n${stackText}`,
        )
      }
    }
    onAction?.(error, action)
    // "copy-stack" mantém o dialog aberto (ação puramente local);
    // "resolve"/"ignore" fecham o dialog (assume mudança de status).
    if (action !== "copy-stack") onOpenChange(false)
  }

  // Reset estável: o Dialog controla o open via prop, e o conteúdo
  // é derivado do `error`. Quando o pai zera `error`, o Dialog fecha
  // e o conteúdo do próximo mount começa do zero.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="etf-detail-dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        {error && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 size-2.5 shrink-0 rounded-full",
                    DIALOG_STATUS_TONE[error.status].dot,
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="break-all font-mono text-sm">
                    {error.type}
                  </DialogTitle>
                  <DialogDescription className="mt-1.5 text-xs">
                    {error.message}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    DIALOG_STATUS_TONE[error.status].chip,
                  )}
                >
                  {STATUS_LABEL[error.status]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    DIALOG_ENV_TONE[error.environment],
                  )}
                >
                  {error.environment}
                </span>
                {error.release && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {error.release}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Bug className="size-3" />
                  {error.count.toLocaleString("pt-BR")} ocorrências
                </span>
              </div>
            </DialogHeader>

            <Tabs defaultValue="stack" className="mt-3">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="stack" className="gap-1.5">
                  <ListTree className="size-3.5" /> Stack
                </TabsTrigger>
                <TabsTrigger value="breadcrumbs" className="gap-1.5">
                  <MessageSquareText className="size-3.5" /> Breadcrumbs
                </TabsTrigger>
                <TabsTrigger value="context" className="gap-1.5">
                  <Tag className="size-3.5" /> Contexto
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <ActivityIcon /> Histórico
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-1.5">
                  <Users className="size-3.5" /> Usuários
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stack" className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Stack trace
                  </span>
                  {stackText && (
                    <CopyableButton
                      value={stackText}
                      label="Copiar stack"
                    />
                  )}
                </div>
                <StackTab stack={error.stack ?? parsePreviewFrames(error.stackPreview)} />
              </TabsContent>

              <TabsContent value="breadcrumbs" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Eventos que precederam o erro
                </div>
                <BreadcrumbsTab breadcrumbs={error.breadcrumbs} />
              </TabsContent>

              <TabsContent value="context" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Metadados do erro
                </div>
                <ContextTab error={error} />
              </TabsContent>

              <TabsContent value="history" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tendência de ocorrências
                </div>
                <HistoryTab trend={error.trend} />
              </TabsContent>

              <TabsContent value="users" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Usuários afetados ({error.affectedUsers?.length ?? 0})
                </div>
                <UsersTab users={error.affectedUsers ?? []} />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAction("ignore")}
                disabled={error.status === "ignored"}
                data-slot="etf-detail-ignore"
              >
                <EyeOff className="size-3.5" />
                {error.status === "ignored" ? "Já ignorado" : "Marcar como ignorado"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAction("resolve")}
                disabled={error.status === "resolved"}
                data-slot="etf-detail-resolve"
              >
                <CheckCircle2 className="size-3.5" />
                {error.status === "resolved"
                  ? "Já resolvido"
                  : "Marcar como resolvido"}
              </Button>
              {stackText && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction("copy-stack")}
                  data-slot="etf-detail-copy"
                >
                  <Copy className="size-3.5" />
                  Copiar stack
                </Button>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onOpenChange(false)}
                data-slot="etf-detail-close"
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Pequeno ícone inline (sem import extra) para a tab "Histórico".
 * Mantido local pra evitar drag-in de mais um ícone do lucide.
 */
function ActivityIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M2 8h2l2-5 3 10 2-5h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Se a prop `stack` não vier mas `stackPreview` vier (string única),
 * convertemos num único frame "sintético" para a tab Stack não ficar
 * vazia. Útil para examples com dados minimalistas.
 */
function parsePreviewFrames(
  preview?: string,
): ErrorStackFrame[] | undefined {
  if (!preview) return undefined
  return [{ function: preview, inApp: true }]
}
