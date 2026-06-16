/**
 * IncidentTimeline — timeline vertical de eventos de um incidente.
 *
 * Lista cronológica de eventos (detect → page → escalate → mitigate → resolve,
 * etc.) com:
 *  - Sticky header exibindo status, duração total e meta do incidente;
 *  - Trilho vertical pontilhado com nós circulares coloridos por severidade;
 *  - Chip por tipo de evento (detect, page, escalate, note, deploy, mitigate,
 *    resolve, postmortem, rollback);
 *  - Timestamp relativo ("há 2 min") e absoluto (HH:mm:ss) lado a lado;
 *  - Avatar + nome + role do autor opcional ao lado de cada evento;
 *  - Estado vazio elegante (zero eventos, sem tela quebrada);
 *  - Modo `live` que re-renderiza tempos relativos a cada 30s, com cleanup
 *    correto via `useRef` + `useEffect` no unmount.
 *
 * Cores de status/severidade seguem o padrão semântico do briefing:
 *   - emerald-500 (resolved/ok)
 *   - sky-400 (info, low/medium)
 *   - amber-500 (warning, mitigate)
 *   - rose-500 (critical, page)
 *   - violet-500 (deploy, rollback)
 *   - slate (note, neutros)
 *
 * Sem dependências novas (lucide-react já cobre os ícones).
 * PRNG / Math.random: N/A — a timeline é puramente dirigida por props;
 *   os exemplos usam timestamps determinísticos.
 */

import * as React from "react"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleDashed,
  Clock,
  GitCommitHorizontal,
  History,
  MessageSquare,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  Stethoscope,
  Wrench,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  IncidentActor,
  IncidentEventType,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEvent,
  IncidentTimelineProps,
} from "@/components/ui/incident-timeline-types"

/* -------------------------------------------------------------------------- */
/*  Constantes                                                                */
/* -------------------------------------------------------------------------- */

const LIVE_TICK_MS = 30_000

/** Cor do nó / dot por severidade (classe Tailwind v4 literal — sem interpolação). */
const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  low: "bg-sky-400 ring-sky-400/40",
  medium: "bg-sky-400 ring-sky-400/40",
  high: "bg-amber-500 ring-amber-500/40",
  critical: "bg-rose-500 ring-rose-500/40",
}

/** Cor da borda do nó por severidade. */
const SEVERITY_NODE_BORDER: Record<IncidentSeverity, string> = {
  low: "border-sky-400/50",
  medium: "border-sky-400/50",
  high: "border-amber-500/50",
  critical: "border-rose-500/50",
}

/** Cor do chip do tipo de evento (background + texto). */
const TYPE_CHIP: Record<IncidentEventType, string> = {
  detect: "bg-sky-400/15 text-sky-600 ring-sky-400/30 dark:text-sky-300",
  page: "bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300",
  escalate: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300",
  note: "bg-muted text-muted-foreground ring-border",
  deploy: "bg-violet-500/15 text-violet-600 ring-violet-500/30 dark:text-violet-300",
  mitigate: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300",
  resolve: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300",
  postmortem: "bg-sky-400/15 text-sky-600 ring-sky-400/30 dark:text-sky-300",
  rollback: "bg-violet-500/15 text-violet-600 ring-violet-500/30 dark:text-violet-300",
}

/** Rótulo humano por tipo. */
const TYPE_LABEL: Record<IncidentEventType, string> = {
  detect: "Detect",
  page: "Page",
  escalate: "Escalate",
  note: "Note",
  deploy: "Deploy",
  mitigate: "Mitigate",
  resolve: "Resolve",
  postmortem: "Postmortem",
  rollback: "Rollback",
}

/** Ícone por tipo. */
const TYPE_ICON: Record<IncidentEventType, React.ComponentType<{ className?: string }>> = {
  detect: Radio,
  page: Bell,
  escalate: ShieldAlert,
  note: MessageSquare,
  deploy: GitCommitHorizontal,
  mitigate: Wrench,
  resolve: CheckCircle2,
  postmortem: Stethoscope,
  rollback: RotateCcw,
}

/** Estilo do badge de status no header. */
const STATUS_LABEL: Record<IncidentStatus, string> = {
  ongoing: "Em andamento",
  mitigated: "Mitigado",
  resolved: "Resolvido",
}

const STATUS_CHIP: Record<IncidentStatus, string> = {
  ongoing: "bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300",
  mitigated: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300",
  resolved: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300",
}

const STATUS_DOT: Record<IncidentStatus, string> = {
  ongoing: "bg-rose-500",
  mitigated: "bg-amber-500",
  resolved: "bg-emerald-500",
}

/** Label de severidade global no header. */
const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
}

/** Cor do texto/borda do badge de severidade. */
const SEVERITY_BADGE: Record<IncidentSeverity, string> = {
  low: "bg-sky-400/15 text-sky-600 ring-sky-400/30 dark:text-sky-300",
  medium: "bg-sky-400/15 text-sky-600 ring-sky-400/30 dark:text-sky-300",
  high: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300",
  critical: "bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300",
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function parseDate(input: string): Date | null {
  if (!input) return null
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Tempo relativo em pt-BR ("agora mesmo", "há 2 min", "há 1 h 13 min"). */
function formatRelative(then: Date, now: Date): string {
  const diffMs = now.getTime() - then.getTime()
  if (diffMs < 0) return "agora"
  if (diffMs < 45_000) return "agora mesmo"
  const totalSec = Math.floor(diffMs / 1000)
  if (totalSec < 60) return `há ${totalSec} s`
  const totalMin = Math.floor(totalSec / 60)
  if (totalMin < 60) return `há ${totalMin} min`
  const totalH = Math.floor(totalMin / 60)
  if (totalH < 24) {
    const remMin = totalMin - totalH * 60
    return remMin > 0 ? `há ${totalH} h ${remMin} min` : `há ${totalH} h`
  }
  const totalD = Math.floor(totalH / 24)
  if (totalD < 7) return `há ${totalD} d`
  const totalW = Math.floor(totalD / 7)
  return `há ${totalW} sem`
}

/** Timestamp absoluto "HH:mm:ss". */
function formatClock(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Duração entre duas datas em formato compacto pt-BR ("2 h 13 min", "45 s"). */
function formatDuration(start: Date, end: Date): string {
  const diffMs = Math.max(0, end.getTime() - start.getTime())
  const totalSec = Math.floor(diffMs / 1000)
  if (totalSec < 60) return `${totalSec} s`
  const totalMin = Math.floor(totalSec / 60)
  if (totalMin < 60) return `${totalMin} min`
  const totalH = Math.floor(totalMin / 60)
  const remMin = totalMin - totalH * 60
  if (totalH < 24) return remMin > 0 ? `${totalH} h ${remMin} min` : `${totalH} h`
  const totalD = Math.floor(totalH / 24)
  const remH = totalH - totalD * 24
  return remH > 0 ? `${totalD} d ${remH} h` : `${totalD} d`
}

/** Iniciais a partir do nome, com fallback de 1 letra. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

/** Hash determinístico de uma string → cor (HSL determinístico, sem Math.random). */
function hashHue(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h % 360
}

/* -------------------------------------------------------------------------- */
/*  Sub-componentes                                                           */
/* -------------------------------------------------------------------------- */

function Avatar({ actor }: { actor: IncidentActor }) {
  const hue = hashHue(actor.name)
  const bg = `hsl(${hue} 60% 45%)`
  if (actor.avatar) {
    return (
      <img
        src={actor.avatar}
        alt={actor.name}
        className="size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    )
  }
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1 ring-border"
      style={{ backgroundColor: bg }}
    >
      {initials(actor.name)}
    </span>
  )
}

function ActorBlock({ actor }: { actor: IncidentActor }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Avatar actor={actor} />
      <span className="font-medium text-foreground">{actor.name}</span>
      {actor.role ? <span className="text-muted-foreground">· {actor.role}</span> : null}
    </div>
  )
}

function EventRow({
  event,
  isLast,
  now,
  onClick,
}: {
  event: IncidentTimelineEvent
  isLast: boolean
  now: Date
  onClick?: (e: IncidentTimelineEvent) => void
}) {
  const date = parseDate(event.t)
  const Icon = TYPE_ICON[event.type]
  const meta = event.meta ?? {}

  return (
    <li
      data-slot="incident-timeline-event"
      data-severity={event.severity}
      data-event-id={event.id}
      className="group relative flex gap-3 pl-0 sm:gap-4"
    >
      {/* trilho + nó */}
      <div className="relative flex w-6 shrink-0 flex-col items-center pt-1.5">
        <span
          aria-hidden
          data-slot="incident-timeline-node"
          data-severity={event.severity}
          className={cn(
            "absolute left-1/2 top-3 -translate-x-1/2 rounded-full border-2 border-card",
            SEVERITY_NODE_BORDER[event.severity],
            SEVERITY_DOT[event.severity],
            "size-3.5",
          )}
          style={{ boxShadow: "0 0 0 4px var(--background)" }}
        />
        {!isLast && (
          <span
            aria-hidden
            className="absolute left-1/2 top-7 -translate-x-1/2 h-full w-px border-l border-dashed border-border"
          />
        )}
      </div>

      {/* corpo */}
      <div
        className={cn(
          "min-w-0 flex-1 pb-5",
          onClick && "cursor-pointer",
        )}
        onClick={onClick ? () => onClick(event) : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onClick(event)
                }
              }
            : undefined
        }
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Evento: ${event.title}` : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
              TYPE_CHIP[event.type],
            )}
          >
            <Icon className="size-3" />
            {TYPE_LABEL[event.type]}
          </span>
          {date ? (
            <span
              data-slot="incident-timeline-time"
              className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground"
            >
              <Clock className="size-3" />
              <span className="font-medium text-foreground/80" title={formatRelative(date, now)}>
                {formatRelative(date, now)}
              </span>
              <span aria-hidden>·</span>
              <span>{formatClock(date)}</span>
            </span>
          ) : null}
        </div>

        <h3 className="mt-1.5 text-sm font-semibold text-foreground">{event.title}</h3>

        {event.description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.description}</p>
        ) : null}

        {Object.keys(meta).length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {Object.entries(meta).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <span className="font-medium text-foreground/80">{k}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{String(v)}</span>
              </span>
            ))}
          </div>
        ) : null}

        {event.actor ? (
          <div className="mt-2">
            <ActorBlock actor={event.actor} />
          </div>
        ) : null}
      </div>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CircleDashed className="size-5" />
      </span>
      <p className="text-sm font-medium text-foreground">Sem eventos registrados</p>
      <p className="max-w-[28ch] text-xs text-muted-foreground">
        Eventos aparecerão aqui conforme forem disparados pela sua fonte de telemetria.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                     */
/* -------------------------------------------------------------------------- */

function IncidentTimeline({
  events,
  status,
  severity,
  startedAt,
  resolvedAt,
  title = "Incidente",
  live = false,
  onEventClick,
  className,
  ...props
}: IncidentTimelineProps) {
  // Memoriza Date refs baseado nas strings primitivas: sem isso, cada render
  // cria novos Date objects e dispara useEffect([resolved]) em loop.
  const started = React.useMemo(() => parseDate(startedAt), [startedAt])
  const resolved = React.useMemo(
    () => parseDate(resolvedAt ?? ""),
    [resolvedAt],
  )
  const endRef = React.useRef<Date>(resolved ?? new Date())
  // `now` é o "agora" usado para formatRelative. Quando `live`, atualiza a cada
  // 30s; quando !live, é fixo em mount. Para resolved, congela em resolvedAt.
  const [now, setNow] = React.useState<Date>(() => {
    if (resolved) return resolved
    if (typeof window !== "undefined") return new Date()
    return new Date(0)
  })
  // ref p/ guardar o handle do setInterval (cleanup via ref, sem warning).
  const intervalRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (resolved) {
      endRef.current = resolved
      setNow(resolved)
    } else {
      endRef.current = new Date()
    }
  }, [resolved])

  React.useEffect(() => {
    if (!live || resolved) {
      // sem timer: resolved congela; !live também não atualiza.
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    // live mode: atualiza now a cada 30s.
    intervalRef.current = window.setInterval(() => {
      setNow(new Date())
    }, LIVE_TICK_MS)
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [live, resolved])

  const durationLabel = started
    ? formatDuration(started, endRef.current)
    : "—"
  const eventCount = events.length

  return (
    <section
      data-slot="incident-timeline"
      data-status={status}
      data-severity={severity}
      aria-label={`Timeline do incidente: ${title}`}
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground",
        className,
      )}
      {...props}
    >
      {/* header sticky */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-2.5 shrink-0 rounded-full ring-2 ring-card",
              STATUS_DOT[status],
              status === "ongoing" && "animate-pulse",
            )}
          />
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
                  STATUS_CHIP[status],
                )}
              >
                {status === "ongoing" ? <AlertTriangle className="size-3" /> : null}
                {status === "mitigated" ? <Wrench className="size-3" /> : null}
                {status === "resolved" ? <CheckCircle2 className="size-3" /> : null}
                {STATUS_LABEL[status]}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {eventCount} evento{eventCount === 1 ? "" : "s"} · duração {durationLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
              SEVERITY_BADGE[severity],
            )}
          >
            Severidade {SEVERITY_LABEL[severity]}
          </span>
          {live && status === "ongoing" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          ) : null}
        </div>
      </header>

      {/* body rolável */}
      <div
        data-slot="incident-timeline-body"
        className="relative max-h-[28rem] overflow-y-auto px-4 py-3"
      >
        {eventCount === 0 ? (
          <EmptyState />
        ) : (
          <ol className="m-0 flex flex-col gap-0 p-0">
            {events.map((ev, i) => (
              <EventRow
                key={ev.id}
                event={ev}
                isLast={i === events.length - 1}
                now={now}
                onClick={onEventClick}
              />
            ))}
          </ol>
        )}
      </div>

      {/* footer: meta global */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <History className="size-3" />
          Início {started ? formatClock(started) : "—"}
          {resolved ? ` · resolvido ${formatClock(resolved)}` : null}
        </span>
        <span className="inline-flex items-center gap-1">
          <Send className="size-3" />
          {eventCount} entrada{eventCount === 1 ? "" : "s"}
        </span>
      </footer>
    </section>
  )
}

export { IncidentTimeline }
export type { IncidentActor, IncidentEventType, IncidentSeverity, IncidentStatus, IncidentTimelineEvent }
