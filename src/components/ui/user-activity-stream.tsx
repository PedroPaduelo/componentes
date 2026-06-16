import * as React from "react"
import {
  Activity,
  AlertTriangle,
  Flag,
  Globe2,
  LogIn,
  LogOut,
  MapPin,
  MousePointerClick,
  Send,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type {
  UserActivityAction,
  UserActivityEvent,
  UserActivityGeo,
  UserActivityGroupBy,
  UserActivityStreamProps,
} from "@/components/ui/user-activity-stream-types"

/* -------------------------------------------------------------------------- */
/*                              constantes                                    */
/* -------------------------------------------------------------------------- */

/** Cap superior do `maxItems` recebido via prop. Defesa contra payloads absurdos. */
const HARD_CAP = 500

/** Intervalo (ms) entre inserções automáticas no modo `live`. */
const LIVE_TICK_MS = 5_000

/** Janela (ms) usada para calcular "ações/min" no header. */
const ACTIONS_WINDOW_MS = 60_000

/** Ações listadas nos chips de filtro (ordem alfabética). */
const FILTER_ACTIONS: UserActivityAction[] = [
  "abuse_flag",
  "click",
  "error",
  "form_submit",
  "login",
  "logout",
  "page_view",
  "purchase",
  "signup",
]

/** Períodos pré-definidos para o filtro de janela temporal. */
type Period = "all" | "5m" | "1h"
const PERIODS: { value: Period; label: string; ms: number }[] = [
  { value: "all", label: "Tudo", ms: Number.POSITIVE_INFINITY },
  { value: "1h", label: "1h", ms: 60 * 60 * 1000 },
  { value: "5m", label: "5m", ms: 5 * 60 * 1000 },
]

/* -------------------------------------------------------------------------- */
/*                              PRNG seedado                                  */
/* -------------------------------------------------------------------------- */

/** PRNG determinístico (mulberry32) — usado para a simulação live. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  "Ana",
  "Bruno",
  "Camila",
  "Diego",
  "Elena",
  "Felipe",
  "Gabi",
  "Hugo",
  "Iris",
  "Jonas",
  "Karen",
  "Léo",
  "Marina",
  "Nina",
  "Otávio",
  "Paula",
  "Quinn",
  "Rafa",
  "Sofia",
  "Theo",
  "Úrsula",
  "Vivi",
  "Wagner",
  "Xuxa",
  "Yara",
  "Zeca",
]
const LAST_NAMES = [
  "Almeida",
  "Barbosa",
  "Costa",
  "Dias",
  "Esteves",
  "Ferreira",
  "Gomes",
  "Horta",
  "Iglesias",
  "Jardim",
  "Klein",
  "Lima",
  "Mendes",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Queiroz",
  "Rocha",
  "Silva",
  "Teixeira",
]
const PAGES = [
  "/dashboard",
  "/settings",
  "/billing",
  "/reports",
  "/projects",
  "/integrations",
  "/admin/users",
  "/admin/audit",
  "/login",
  "/signup",
  "/onboarding",
  "/support",
]
const CITIES: UserActivityGeo[] = [
  { country: "BR", city: "São Paulo" },
  { country: "BR", city: "Rio de Janeiro" },
  { country: "BR", city: "Belo Horizonte" },
  { country: "US", city: "New York" },
  { country: "US", city: "San Francisco" },
  { country: "DE", city: "Berlin" },
  { country: "FR", city: "Paris" },
  { country: "GB", city: "London" },
  { country: "JP", city: "Tokyo" },
  { country: "IN", city: "Bengaluru" },
]
const ROLES = ["Admin", "Editor", "Viewer", "Owner", "Auditor"]

const ACTION_VERBS: Record<UserActivityAction, string> = {
  login: "entrou na conta",
  logout: "saiu da conta",
  page_view: "visitou",
  form_submit: "submeteu formulário",
  click: "clicou em",
  error: "disparou erro em",
  abuse_flag: "foi sinalizado por",
  purchase: "comprou",
  signup: "criou conta",
}

/** Gera 1 evento simulado no modo `live`. Determinístico pelo `seed` recebido. */
function generateLiveEvent(seed: number): UserActivityEvent {
  const rng = mulberry32(seed)
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)] ?? "Ana"
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)] ?? "Silva"
  const userId = `u-${Math.floor(rng() * 1e6)
    .toString(36)
    .padStart(4, "0")}`
  const action = FILTER_ACTIONS[Math.floor(rng() * FILTER_ACTIONS.length)] ?? "page_view"
  const page = PAGES[Math.floor(rng() * PAGES.length)] ?? "/"
  const geo = CITIES[Math.floor(rng() * CITIES.length)] ?? CITIES[0]!
  const role = ROLES[Math.floor(rng() * ROLES.length)] ?? "Viewer"
  const ipLast = Math.floor(rng() * 256)
  const flagged = action === "abuse_flag" || rng() < 0.04
  return {
    id: `e-${seed.toString(36)}-${Math.floor(rng() * 1e9).toString(36)}`,
    t: new Date().toISOString(),
    user: {
      id: userId,
      name: `${first} ${last}`,
      role,
      avatar: `https://i.pravatar.cc/64?u=${userId}`,
    },
    action,
    page,
    ip: `192.168.${Math.floor(rng() * 256)}.${ipLast}`,
    geo,
    flagged,
    payload:
      action === "purchase"
        ? [{ key: "plan", value: rng() < 0.5 ? "pro" : "team" }]
        : action === "error"
          ? [{ key: "code", value: 500 }]
          : undefined,
    durationMs: action === "page_view" ? Math.floor(rng() * 60_000) : undefined,
  }
}

/* -------------------------------------------------------------------------- */
/*                              helpers                                       */
/* -------------------------------------------------------------------------- */

function relativeTime(iso: string, now: number): string {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, now - t)
  if (diff < 5_000) return "agora"
  if (diff < 60_000) return `há ${Math.floor(diff / 1000)}s`
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)}h`
  return `há ${Math.floor(diff / 86_400_000)}d`
}

function describeEvent(ev: UserActivityEvent): string {
  const verb = ACTION_VERBS[ev.action]
  if (ev.action === "purchase" && ev.payload?.[0]) {
    return `${verb} plano ${ev.payload[0].value}`
  }
  if (ev.page) return `${verb} ${ev.page}`
  return verb
}

function truncateIp(ip?: string): string {
  if (!ip) return ""
  const parts = ip.split(".")
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.x.x`
}

function flagEmoji(geo?: UserActivityGeo): string {
  if (!geo) return "🌐"
  // mapeamento enxuto (não-oficial, basta pra visual). Cobre o set usado em CITIES.
  const map: Record<string, string> = {
    BR: "🇧🇷",
    US: "🇺🇸",
    DE: "🇩🇪",
    FR: "🇫🇷",
    GB: "🇬🇧",
    JP: "🇯🇵",
    IN: "🇮🇳",
  }
  return map[geo.country] ?? "🌐"
}

/** Mapa ação → ícone Lucide + classes de cor (por evento, não tema). */
const ACTION_META: Record<
  UserActivityAction,
  { Icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  login: { Icon: LogIn, colorClass: "text-emerald-500" },
  signup: { Icon: UserPlus, colorClass: "text-emerald-500" },
  click: { Icon: MousePointerClick, colorClass: "text-emerald-500" },
  page_view: { Icon: Globe2, colorClass: "text-sky-400" },
  form_submit: { Icon: Send, colorClass: "text-amber-500" },
  purchase: { Icon: ShoppingCart, colorClass: "text-emerald-500" },
  error: { Icon: AlertTriangle, colorClass: "text-rose-500" },
  abuse_flag: { Icon: Flag, colorClass: "text-rose-500" },
  logout: { Icon: LogOut, colorClass: "text-gray-500" },
}

function groupKey(
  ev: UserActivityEvent,
  by: UserActivityGroupBy
): string | null {
  if (by === "none") return null
  if (by === "user") return ev.user.id
  if (by === "action") return ev.action
  return ev.page ?? "—"
}

function groupLabel(
  ev: UserActivityEvent,
  by: UserActivityGroupBy
): string {
  if (by === "user") return ev.user.name
  if (by === "action") return ev.action.replace("_", " ")
  return ev.page ?? "—"
}

/* -------------------------------------------------------------------------- */
/*                              subcomponentes                                */
/* -------------------------------------------------------------------------- */

type ActionChipProps = {
  action: UserActivityAction
  active: boolean
  count: number
  onToggle: (action: UserActivityAction) => void
}

function ActionChip({ action, active, count, onToggle }: ActionChipProps) {
  const meta = ACTION_META[action]
  const Icon = meta.Icon
  return (
    <button
      type="button"
      data-slot="user-activity-stream-action-chip"
      data-active={active}
      onClick={() => onToggle(action)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground/30 bg-foreground/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      )}
    >
      <Icon className={cn("size-3.5", active ? "text-foreground" : meta.colorClass)} />
      <span>{action.replace("_", " ")}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          active ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  )
}

type EventRowProps = {
  ev: UserActivityEvent
  now: number
  onUserClick?: (userId: string) => void
  onEventClick?: (event: UserActivityEvent) => void
}

function EventRow({ ev, now, onUserClick, onEventClick }: EventRowProps) {
  const meta = ACTION_META[ev.action]
  const Icon = meta.Icon
  return (
    <div
      data-slot="user-activity-stream-event"
      onClick={onEventClick ? () => onEventClick(ev) : undefined}
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors",
        onEventClick && "cursor-pointer hover:bg-accent/30"
      )}
    >
      <div className="relative">
        <Avatar
          data-slot="user-activity-stream-avatar"
          className="size-8 cursor-pointer ring-1 ring-border"
          onClick={(e) => {
            if (!onUserClick) return
            e.stopPropagation()
            onUserClick(ev.user.id)
          }}
        >
          {ev.user.avatar ? (
            <AvatarImage src={ev.user.avatar} alt={ev.user.name} />
          ) : null}
          <AvatarFallback className="text-[10px]">
            {ev.user.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "ring-card absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full ring-2",
            "bg-card"
          )}
          aria-hidden
        >
          <Icon className={cn("size-2.5", meta.colorClass)} />
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <button
            type="button"
            data-slot="user-activity-stream-user"
            onClick={(e) => {
              if (!onUserClick) return
              e.stopPropagation()
              onUserClick(ev.user.id)
            }}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {ev.user.name}
          </button>
          <span className="truncate text-sm text-muted-foreground">
            {describeEvent(ev)}
          </span>
          {ev.flagged ? (
            <Badge
              variant="destructive"
              className="h-5 rounded-full px-1.5 text-[10px] font-semibold uppercase"
            >
              abuse
            </Badge>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {ev.geo ? (
            <span
              data-slot="user-activity-stream-geo"
              className="inline-flex items-center gap-1"
            >
              <span aria-hidden>{flagEmoji(ev.geo)}</span>
              <MapPin className="size-3" />
              <span>{ev.geo.city}</span>
            </span>
          ) : null}
          {ev.ip ? (
            <span
              data-slot="user-activity-stream-ip"
              className="font-mono tabular-nums"
            >
              {truncateIp(ev.ip)}
            </span>
          ) : null}
          {ev.user.role ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
              {ev.user.role}
            </span>
          ) : null}
        </div>
      </div>

      <time
        dateTime={ev.t}
        data-slot="user-activity-stream-time"
        className="shrink-0 text-xs tabular-nums text-muted-foreground"
      >
        {relativeTime(ev.t, now)}
      </time>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              componente                                    */
/* -------------------------------------------------------------------------- */

/**
 * Feed de atividades de usuários (estilo Hotjar / FullStory / Mixpanel Live).
 *
 * Aceita uma lista inicial de `events` e, em modo `live`, injeta eventos novos
 * a cada 5s via PRNG seedado. Suporta auto-scroll pro fim enquanto o usuário
 * não tiver rolado pra cima — nesse caso, expõe um botão "pular para o mais
 * recente". Suporta agrupamento visual por usuário, ação ou página.
 */
function UserActivityStream({
  events,
  groupBy = "none",
  live = false,
  maxItems = 200,
  onUserClick,
  onEventClick,
  className,
  ...props
}: UserActivityStreamProps) {
  /* ----------------------------- state ----------------------------------- */
  const [pool, setPool] = React.useState<UserActivityEvent[]>(() => events)
  const [activeActions, setActiveActions] = React.useState<Set<UserActivityAction>>(
    () => new Set()
  )
  const [userQuery, setUserQuery] = React.useState("")
  const [period, setPeriod] = React.useState<Period>("all")
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [now, setNow] = React.useState(() => Date.now())

  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const liveSeedRef = React.useRef<number>(Date.now() & 0xffff)

  /* ---------------------- sincroniza props -> state --------------------- */
  // Reset do pool quando a prop `events` muda de identidade.
  React.useEffect(() => {
    setPool(events)
  }, [events])

  /* -------------------------- "agora" tick ------------------------------- */
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  /* ----------------------------- live tick ------------------------------- */
  React.useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      liveSeedRef.current = (liveSeedRef.current + 1) >>> 0
      setPool((prev) => {
        const next = [generateLiveEvent(liveSeedRef.current), ...prev]
        const cap = Math.min(HARD_CAP, maxItems)
        return next.length > cap ? next.slice(0, cap) : next
      })
    }, LIVE_TICK_MS)
    return () => clearInterval(id)
  }, [live, maxItems])

  /* ------------------------- auto-scroll watcher ------------------------- */
  // Detecta se o usuário rolou pra cima (longe do fim). Quando sim, desliga
  // o auto-scroll e mostra o botão "pular para o mais recente".
  const onScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const slack = 32 // px de tolerância
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distFromBottom <= slack
    if (atBottom && !autoScroll) setAutoScroll(true)
    if (!atBottom && autoScroll) setAutoScroll(false)
  }, [autoScroll])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (autoScroll) {
      // scrolla pro fim após o próximo paint (depois de o React pintar a lista)
      const id = requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      })
      return () => cancelAnimationFrame(id)
    }
    return undefined
  }, [pool, autoScroll])

  /* ------------------------------ filtros ------------------------------- */
  const visible = React.useMemo(() => {
    const cutoff = period === "all" ? -Infinity : now - (PERIODS.find((p) => p.value === period)?.ms ?? 0)
    const q = userQuery.trim().toLowerCase()
    return pool.filter((ev) => {
      if (activeActions.size > 0 && !activeActions.has(ev.action)) return false
      if (q && !ev.user.name.toLowerCase().includes(q)) return false
      if (new Date(ev.t).getTime() < cutoff) return false
      return true
    })
  }, [pool, activeActions, userQuery, period, now])

  /* ------------------------------ métricas ------------------------------ */
  const metrics = React.useMemo(() => {
    const cutoff = now - ACTIONS_WINDOW_MS
    let actionsPerMin = 0
    let errors = 0
    let flags = 0
    const users = new Set<string>()
    for (const ev of pool) {
      const t = new Date(ev.t).getTime()
      if (t >= cutoff) actionsPerMin += 1
      if (ev.action === "error") errors += 1
      if (ev.flagged) flags += 1
      users.add(ev.user.id)
    }
    return {
      activeUsers: users.size,
      actionsPerMin: Math.round(actionsPerMin),
      errors,
      flags,
    }
  }, [pool, now])

  const actionCounts = React.useMemo(() => {
    const m: Partial<Record<UserActivityAction, number>> = {}
    for (const ev of pool) m[ev.action] = (m[ev.action] ?? 0) + 1
    return m
  }, [pool])

  /* --------------------- montagem agrupada (groupBy) --------------------- */
  const sections = React.useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "__all__", label: null as string | null, events: visible }]
    }
    const buckets: { key: string; label: string; events: UserActivityEvent[] }[] = []
    for (const ev of visible) {
      const k = groupKey(ev, groupBy) ?? "__none__"
      const last = buckets[buckets.length - 1]
      if (last && last.key === k) {
        last.events.push(ev)
      } else {
        buckets.push({ key: k, label: groupLabel(ev, groupBy), events: [ev] })
      }
    }
    return buckets
  }, [visible, groupBy])

  const toggleAction = React.useCallback((action: UserActivityAction) => {
    setActiveActions((prev) => {
      const next = new Set(prev)
      if (next.has(action)) next.delete(action)
      else next.add(action)
      return next
    })
  }, [])

  const clearFilters = React.useCallback(() => {
    setActiveActions(new Set())
    setUserQuery("")
    setPeriod("all")
  }, [])

  const hasFilter = activeActions.size > 0 || userQuery !== "" || period !== "all"

  // re-render a cada 30s pra "agora" virar "há 30s" sem precisar de interação
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  /* ------------------------------ render -------------------------------- */
  return (
    <div
      data-slot="user-activity-stream"
      data-group-by={groupBy}
      data-live={live}
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm ring-1",
        className
      )}
      {...props}
    >
      {/* Header ------------------------------------------------------- */}
      <div
        data-slot="user-activity-stream-header"
        className="border-b border-border bg-card/80 px-4 py-3 backdrop-blur"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="text-muted-foreground size-4" />
            <h3 className="text-sm font-semibold tracking-tight">
              Atividade dos usuários
            </h3>
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                ao vivo
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
            <span>
              <strong className="text-foreground">{metrics.activeUsers}</strong>{" "}
              usuários ativos
            </span>
            <span className="hidden sm:inline">
              <strong className="text-foreground">{metrics.actionsPerMin}</strong>{" "}
              ações/min
            </span>
            <span className="hidden md:inline">
              <strong className="text-rose-500">{metrics.errors}</strong> erros
            </span>
            <span className="hidden md:inline">
              <strong className="text-rose-500">{metrics.flags}</strong> flags
            </span>
          </div>
        </div>

        {/* Filtros ----------------------------------------------------- */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_ACTIONS.map((a) => (
              <ActionChip
                key={a}
                action={a}
                active={activeActions.has(a)}
                count={actionCounts[a] ?? 0}
                onToggle={toggleAction}
              />
            ))}
            {hasFilter ? (
              <button
                type="button"
                data-slot="user-activity-stream-clear-filters"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <X className="size-3" />
                limpar
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Input
              data-slot="user-activity-stream-user-search"
              placeholder="Buscar usuário…"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="h-8 max-w-xs text-xs"
            />
            <div
              data-slot="user-activity-stream-period"
              role="tablist"
              aria-label="Período"
              className="ml-auto inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5"
            >
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="tab"
                  aria-selected={period === p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "h-6 rounded-full px-2.5 text-[11px] font-medium transition-colors",
                    period === p.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista -------------------------------------------------------- */}
      <div className="relative min-h-0 flex-1">
        <div
          className="h-full"
          ref={(node) => {
            if (node) {
              const viewport = node.querySelector<HTMLDivElement>(
                "[data-slot=scroll-area-viewport]"
              )
              scrollRef.current = viewport
            } else {
              scrollRef.current = null
            }
          }}
        >
          <div
            data-slot="user-activity-stream-list"
            onScroll={onScroll}
            className="min-h-full"
          >
            {sections.length === 0 ? (
              <div
                data-slot="user-activity-stream-empty"
                className="text-muted-foreground grid place-items-center px-4 py-12 text-center text-sm"
              >
                Nenhum evento corresponde aos filtros.
              </div>
            ) : (
              sections.map((section) => (
                <section
                  key={section.key}
                  data-slot="user-activity-stream-section"
                  data-section-key={section.key}
                >
                  {section.label ? (
                    <header
                      data-slot="user-activity-stream-section-header"
                      className="bg-muted/40 text-foreground sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur"
                    >
                      <span>{section.label}</span>
                      <span className="text-muted-foreground font-normal normal-case tracking-normal">
                        · {section.events.length} eventos
                      </span>
                    </header>
                  ) : null}
                  {section.events.map((ev) => (
                    <EventRow
                      key={ev.id}
                      ev={ev}
                      now={now}
                      onUserClick={onUserClick}
                      onEventClick={onEventClick}
                    />
                  ))}
                </section>
              ))
            )}
          </div>
        </div>

        {/* Botão "pular para o mais recente" ---------------------------- */}
        {!autoScroll ? (
          <button
            type="button"
            data-slot="user-activity-stream-jump-latest"
            onClick={() => {
              setAutoScroll(true)
              const el = scrollRef.current
              if (el) el.scrollTop = el.scrollHeight
            }}
            className="bg-foreground text-background hover:bg-foreground/90 absolute right-4 bottom-4 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg"
          >
            Pular para o mais recente
          </button>
        ) : null}
      </div>
    </div>
  )
}

export { UserActivityStream }
