/**
 * Composição "Observability Command Center" (Pulse).
 *
 * Um centro de comando de observabilidade VIVO — não o grid de gráficos
 * estáticos do Grafana. O destaque é um service mesh em que os pacotes de
 * request FLUEM em tempo real pelas conexões (SVG + requestAnimationFrame),
 * com golden signals em sparklines rolando, heatmap de latência, log stream
 * ao vivo, trace waterfall, alertas e SLO. Tudo dirigido por um relógio
 * simulado determinístico (PRNG seedado pelo tick — zero Math.random).
 *
 * Interações: play/pause do live, seletor de janela de tempo, clique num
 * serviço do mesh (atualiza signals + trace + heatmap), injeção de incidente
 * (degrada o serviço e propaga em cascata, disparando alertas e logs de erro)
 * e filtro do log por nível.
 *
 * Casco em tokens shadcn (bg-card/border-border/foreground) → tema reativo.
 * Cores verde/âmbar/rosa e a escala do heatmap são severidade/data-viz.
 */

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Gauge,
  Globe,
  Layers,
  Pause,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Siren,
  Workflow,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ui/animated-number"
import {
  CONSUMERS_OF,
  DOWNSTREAM_OF,
  EDGES,
  HTTP_METHODS,
  LOG_LEVEL_CLASSES,
  LOG_MESSAGES,
  LOG_PATHS,
  MESH_VIEWBOX,
  PACKET_HEX,
  SERVICE_MAP,
  SERVICES,
  STATUS_CLASSES,
  STATUS_HEX,
  STATUS_LABEL,
  STATUS_RANK,
  clamp,
  edgeControl,
  edgePathD,
  formatClock,
  formatCompact,
  formatMs,
  formatPct,
  heatColor,
  mulberry32,
  quadAt,
  seedFor,
  type AlertItem,
  type LogEntry,
  type LogLevel,
  type Point,
  type ServiceStatus,
  type TraceSpan,
} from "./observability-center-data"

/* ------------------------------------------------------------------ */
/*  Constantes de simulação                                            */
/* ------------------------------------------------------------------ */

const HISTORY = 90
const HEAT_ROWS = 7
const HEAT_COLS = 34
const LOG_CAP = 70
const ALERT_CAP = 16
const TICK_MS = 1100
const PARTICLE_COUNT = 72
const BASE_SEED = 0x5eed

type TimeWindow = "live" | "5m" | "1h"

const WINDOW_LEN: Record<TimeWindow, number> = { live: 40, "5m": 64, "1h": HISTORY }
const WINDOW_LABEL: Record<TimeWindow, string> = {
  live: "Tempo real",
  "5m": "Últimos 5 min",
  "1h": "Última hora",
}

const KIND_META = {
  edge: { label: "Edge", Icon: Globe },
  gateway: { label: "Gateway", Icon: Workflow },
  service: { label: "Serviço", Icon: Server },
  datastore: { label: "Datastore", Icon: Database },
  queue: { label: "Fila", Icon: Layers },
} as const

/* ------------------------------------------------------------------ */
/*  Tipos de estado                                                    */
/* ------------------------------------------------------------------ */

type Runtime = {
  rps: number
  p95: number
  err: number
  cpu: number
  mem: number
  status: ServiceStatus
  histRps: number[]
  histP95: number[]
  histErr: number[]
}

type SimState = {
  tick: number
  running: boolean
  selectedId: string
  incidentId: string | null
  timeWindow: TimeWindow
  levels: Record<LogLevel, boolean>
  services: Record<string, Runtime>
  logs: LogEntry[]
  alerts: AlertItem[]
  heatCols: number[][]
  trace: TraceSpan[]
  nextLogId: number
  nextAlertId: number
}

type SimAction =
  | { type: "TICK" }
  | { type: "TOGGLE_RUN" }
  | { type: "SELECT"; id: string }
  | { type: "INJECT"; id: string }
  | { type: "SET_WINDOW"; window: TimeWindow }
  | { type: "TOGGLE_LEVEL"; level: LogLevel }
  | { type: "ACK"; id: number }

/* ------------------------------------------------------------------ */
/*  Helpers de simulação                                               */
/* ------------------------------------------------------------------ */

function deriveStatus(
  err: number,
  p95: number,
  base: number,
  forced: ServiceStatus | null,
): ServiceStatus {
  if (forced) return forced
  if (err > 0.12 || p95 > base * 3) return "critical"
  if (err > 0.04 || p95 > base * 1.8) return "degraded"
  return "healthy"
}

function worse(a: ServiceStatus, b: ServiceStatus): ServiceStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b
}

function pushHist(hist: number[], value: number): number[] {
  const next = hist.length >= HISTORY ? hist.slice(1) : hist.slice()
  next.push(value)
  return next
}

function pickLevel(status: ServiceStatus, r: number): LogLevel {
  if (status === "critical") return r < 0.55 ? "error" : r < 0.82 ? "warn" : "info"
  if (status === "degraded") return r < 0.28 ? "warn" : r < 0.44 ? "error" : r < 0.72 ? "info" : "debug"
  return r < 0.07 ? "warn" : r < 0.68 ? "info" : "debug"
}

function statusCode(level: LogLevel, r: number): number {
  if (level === "error") return r < 0.5 ? 500 : r < 0.8 ? 503 : 504
  if (level === "warn") return r < 0.6 ? 429 : 200
  return r < 0.85 ? 200 : 304
}

function buildTrace(rootId: string, services: Record<string, Runtime>, rng: () => number): TraceSpan[] {
  const root = SERVICE_MAP[rootId]
  if (!root) return []
  const rt = services[rootId]
  const spans: TraceSpan[] = [
    {
      id: rootId,
      service: rootId,
      label: root.name,
      depth: 0,
      startPct: 0,
      widthPct: 100,
      ms: rt.p95,
      status: rt.status,
    },
  ]
  const kids = (DOWNSTREAM_OF[rootId] ?? []).slice(0, 3)
  const weights = kids.map((k) => services[k]?.p95 ?? 12)
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  let cursor = 7
  const segTotal = 86
  kids.forEach((k, i) => {
    const w = clamp((weights[i] / sum) * segTotal * (0.62 + 0.38 * rng()), 5, 60)
    const start = cursor
    cursor += w + 1.5
    const ck = SERVICE_MAP[k]
    spans.push({
      id: `${rootId}-${k}`,
      service: k,
      label: ck.name,
      depth: 1,
      startPct: start,
      widthPct: w,
      ms: services[k]?.p95 ?? 0,
      status: services[k]?.status ?? "healthy",
    })
    const gk = (DOWNSTREAM_OF[k] ?? [])[0]
    if (gk) {
      const cg = SERVICE_MAP[gk]
      spans.push({
        id: `${rootId}-${k}-${gk}`,
        service: gk,
        label: cg.name,
        depth: 2,
        startPct: start + w * 0.32,
        widthPct: Math.max(3, w * 0.5),
        ms: services[gk]?.p95 ?? 0,
        status: services[gk]?.status ?? "healthy",
      })
    }
  })
  return spans
}

function heatColumn(p95: number, base: number, rng: () => number): number[] {
  const ratio = clamp(p95 / (base * 4), 0, 1)
  const center = (1 - ratio) * (HEAT_ROWS - 1) // lento perto do topo (row 0)
  return Array.from({ length: HEAT_ROWS }, (_, row) => {
    const dist = Math.abs(row - center)
    const v = clamp(1 - dist / 2.1, 0, 1) * (0.45 + 0.55 * ratio) + 0.06 * rng()
    return clamp(v, 0, 1)
  })
}

function buildInitialState(): SimState {
  const rng = mulberry32(BASE_SEED)
  const services: Record<string, Runtime> = {}
  for (const def of SERVICES) {
    const histRps: number[] = []
    const histP95: number[] = []
    const histErr: number[] = []
    for (let i = 0; i < HISTORY; i++) {
      histRps.push(def.baseRps * (0.9 + 0.18 * rng()))
      histP95.push(def.baseLatency * (0.85 + 0.4 * rng()))
      histErr.push(0.002 + 0.01 * rng())
    }
    services[def.id] = {
      rps: histRps[HISTORY - 1],
      p95: histP95[HISTORY - 1],
      err: histErr[HISTORY - 1],
      cpu: 0.32 + 0.28 * rng(),
      mem: 0.42 + 0.26 * rng(),
      status: "healthy",
      histRps,
      histP95,
      histErr,
    }
  }
  const heatCols: number[][] = []
  for (let c = 0; c < HEAT_COLS; c++) {
    heatCols.push(heatColumn(services.orders.p95, SERVICE_MAP.orders.baseLatency, rng))
  }
  return {
    tick: 0,
    running: true,
    selectedId: "orders",
    incidentId: null,
    timeWindow: "live",
    levels: { debug: true, info: true, warn: true, error: true },
    services,
    logs: [],
    alerts: [],
    heatCols,
    trace: buildTrace("orders", services, rng),
    nextLogId: 1,
    nextAlertId: 1,
  }
}

function stepTick(state: SimState): SimState {
  const t = state.tick + 1
  const rng = mulberry32(seedFor(t, 7))
  const incident = state.incidentId
  const cascade = new Set<string>()
  if (incident) for (const c of CONSUMERS_OF[incident] ?? []) cascade.add(c)

  const services: Record<string, Runtime> = {}
  let anyBad = false

  SERVICES.forEach((def, idx) => {
    const prev = state.services[def.id]
    const isIncident = incident === def.id
    const isCascade = cascade.has(def.id)

    const wob = Math.sin((t + idx * 11) * 0.21) * 0.12 + Math.sin((t + idx * 5) * 0.5) * 0.035
    let rps = def.baseRps * (1 + wob) + def.baseRps * 0.05 * (rng() - 0.5)
    if (isIncident) rps *= 0.72
    rps = clamp(rps, def.baseRps * 0.4, def.baseRps * 1.5)

    let errTarget = 0.0025 + 0.012 * rng()
    if (isIncident) errTarget = 0.3 + 0.12 * rng()
    else if (isCascade) errTarget = 0.05 + 0.035 * rng()
    const err = clamp(prev.err + (errTarget - prev.err) * 0.35 + 0.004 * (rng() - 0.5), 0, 0.6)

    let latMul = 1 + 0.25 * Math.sin((t + idx * 7) * 0.3)
    if (isIncident) latMul *= 3.3
    else if (isCascade) latMul *= 1.7
    const latTarget = clamp(
      def.baseLatency * latMul * (1 + 0.12 * (rng() - 0.5)),
      def.baseLatency * 0.6,
      def.baseLatency * 5,
    )
    const p95 = prev.p95 * 0.6 + latTarget * 0.4

    const cpuTarget = isIncident ? 0.94 : isCascade ? 0.72 : 0.4 + 0.18 * Math.sin((t + idx) * 0.17)
    const cpu = clamp(prev.cpu + (cpuTarget - prev.cpu) * 0.2 + 0.03 * (rng() - 0.5), 0.05, 0.99)
    const memTarget = isIncident ? 0.88 : isCascade ? 0.7 : 0.46 + 0.16 * Math.cos((t + idx) * 0.13)
    const mem = clamp(prev.mem + (memTarget - prev.mem) * 0.15 + 0.02 * (rng() - 0.5), 0.1, 0.98)

    const status = deriveStatus(err, p95, def.baseLatency, isIncident ? "critical" : isCascade ? "degraded" : null)
    if (status !== "healthy") anyBad = true

    services[def.id] = {
      rps,
      p95,
      err,
      cpu,
      mem,
      status,
      histRps: pushHist(prev.histRps, rps),
      histP95: pushHist(prev.histP95, p95),
      histErr: pushHist(prev.histErr, err),
    }
  })

  /* ---- logs ---- */
  const logCount = 1 + (anyBad ? 2 : 0) + (rng() < 0.5 ? 1 : 0)
  const totalRps = SERVICES.reduce((a, s) => a + services[s.id].rps, 0)
  const newLogs: LogEntry[] = []
  let logId = state.nextLogId
  for (let i = 0; i < logCount; i++) {
    let pick = rng() * totalRps
    let svc = SERVICES[0].id
    for (const s of SERVICES) {
      pick -= services[s.id].rps
      if (pick <= 0) {
        svc = s.id
        break
      }
    }
    const rt = services[svc]
    const level = pickLevel(rt.status, rng())
    const paths = LOG_PATHS[svc] ?? ["/"]
    const msgs = LOG_MESSAGES[level]
    newLogs.push({
      id: logId++,
      t,
      level,
      service: svc,
      method: HTTP_METHODS[Math.floor(rng() * HTTP_METHODS.length)],
      path: paths[Math.floor(rng() * paths.length)],
      status: statusCode(level, rng()),
      ms: Math.round(rt.p95 * (0.5 + rng())),
      message: msgs[Math.floor(rng() * msgs.length)],
    })
  }
  const logs = [...newLogs.reverse(), ...state.logs].slice(0, LOG_CAP)

  /* ---- alerts ---- */
  let alerts = state.alerts
  let alertId = state.nextAlertId
  const touched: AlertItem[] = alerts.map((a) => ({ ...a }))
  for (const def of SERVICES) {
    const newStatus = services[def.id].status
    const active = touched.find((a) => a.service === def.id && a.firing)
    if (newStatus !== "healthy" && !active) {
      touched.unshift({
        id: alertId++,
        service: def.id,
        severity: newStatus === "critical" ? "critical" : "warning",
        title:
          newStatus === "critical"
            ? `${def.name}: taxa de erro elevada`
            : `${def.name}: latência acima do alvo`,
        firing: true,
        acked: false,
        t,
        resolvedT: null,
      })
    } else if (newStatus === "healthy" && active) {
      active.firing = false
      active.resolvedT = t
    } else if (active && newStatus === "critical" && active.severity === "warning") {
      active.severity = "critical"
      active.title = `${def.name}: taxa de erro elevada`
    }
  }
  alerts = touched
    .sort((a, b) => Number(b.firing) - Number(a.firing) || b.t - a.t)
    .slice(0, ALERT_CAP)

  /* ---- heatmap ---- */
  const sel = services[state.selectedId]
  const selBase = SERVICE_MAP[state.selectedId].baseLatency
  const heatCols = [...state.heatCols.slice(1), heatColumn(sel.p95, selBase, rng)]

  /* ---- trace (recalcula a cada 4 ticks) ---- */
  const trace = t % 4 === 0 ? buildTrace(state.selectedId, services, mulberry32(seedFor(t, 99))) : state.trace

  return {
    ...state,
    tick: t,
    services,
    logs,
    alerts,
    heatCols,
    trace,
    nextLogId: logId,
    nextAlertId: alertId,
  }
}

function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "TICK":
      return stepTick(state)
    case "TOGGLE_RUN":
      return { ...state, running: !state.running }
    case "SELECT":
      return {
        ...state,
        selectedId: action.id,
        trace: buildTrace(action.id, state.services, mulberry32(seedFor(state.tick, 13))),
      }
    case "INJECT":
      return { ...state, incidentId: state.incidentId === action.id ? null : action.id }
    case "SET_WINDOW":
      return { ...state, timeWindow: action.window }
    case "TOGGLE_LEVEL":
      return { ...state, levels: { ...state.levels, [action.level]: !state.levels[action.level] } }
    case "ACK":
      return {
        ...state,
        alerts: state.alerts.map((a) => (a.id === action.id ? { ...a, acked: true } : a)),
      }
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers de visualização                                            */
/* ------------------------------------------------------------------ */

function viewHist(hist: number[], window: TimeWindow): number[] {
  return hist.slice(-WINDOW_LEN[window])
}

function trendOf(hist: number[]): number {
  if (hist.length < 7) return 0
  return hist[hist.length - 1] - hist[hist.length - 7]
}

/* ------------------------------------------------------------------ */
/*  Sparkline (SVG)                                                    */
/* ------------------------------------------------------------------ */

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 132
  const H = 40
  const pad = 3
  if (values.length < 2) return <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full" />
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const span = max - min || 1
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
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-10 w-full">
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.4} fill={color} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Radial gauge (270°)                                                */
/* ------------------------------------------------------------------ */

function RadialGauge({
  value,
  size,
  stroke,
  color,
  children,
}: {
  value: number
  size: number
  stroke: number
  color: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const arc = 0.75
  const dashTrack = `${(c * arc).toFixed(2)} ${c.toFixed(2)}`
  const dashVal = `${(c * arc * clamp(value, 0, 1)).toFixed(2)} ${c.toFixed(2)}`
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
            strokeDasharray={dashTrack}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={dashVal}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card shell                                                         */
/* ------------------------------------------------------------------ */

function Panel({
  title,
  icon,
  right,
  className,
  bodyClassName,
  children,
}: {
  title: string
  icon: React.ReactNode
  right?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </div>
        {right}
      </header>
      <div className={cn("min-w-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Service Mesh (SVG vivo)                                            */
/* ------------------------------------------------------------------ */

type EdgeGeo = { from: Point; c: Point; to: Point }

function MeshNode({
  id,
  selected,
  status,
  rps,
  p95,
  onSelect,
}: {
  id: string
  selected: boolean
  status: ServiceStatus
  rps: number
  p95: number
  onSelect: (id: string) => void
}) {
  const def = SERVICE_MAP[id]
  const w = 124
  const h = 46
  const color = STATUS_HEX[status]
  return (
    <g
      transform={`translate(${def.x} ${def.y})`}
      onClick={() => onSelect(id)}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={`${def.name} — ${STATUS_LABEL[status]}`}
    >
      {selected && (
        <rect
          x={-w / 2 - 6}
          y={-h / 2 - 6}
          width={w + 12}
          height={h + 12}
          rx={14}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.6}
          strokeDasharray="5 5"
          opacity={0.9}
        />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={11} fill="var(--card)" stroke="var(--border)" strokeWidth={1} />
      <rect x={-w / 2} y={-h / 2} width={4} height={h} rx={2} fill={color} />
      {status !== "healthy" && (
        <circle cx={w / 2 - 12} cy={-h / 2 + 12} r={5} fill={color} className="origin-center animate-ping" opacity={0.7} />
      )}
      <circle cx={w / 2 - 12} cy={-h / 2 + 12} r={3.4} fill={color} />
      <text x={-w / 2 + 14} y={-3} fill="var(--foreground)" fontSize={13} fontWeight={600}>
        {def.name}
      </text>
      <text x={-w / 2 + 14} y={14} fill="var(--muted-foreground)" fontSize={10.5} fontFamily="ui-monospace, monospace">
        {formatCompact(rps)} rps · {formatMs(p95)}
      </text>
    </g>
  )
}

function ServiceMesh({
  services,
  selectedId,
  incidentId,
  running,
  onSelect,
}: {
  services: Record<string, Runtime>
  selectedId: string
  incidentId: string | null
  running: boolean
  onSelect: (id: string) => void
}) {
  const geo = React.useMemo<EdgeGeo[]>(
    () =>
      EDGES.map((e) => {
        const from = { x: SERVICE_MAP[e.from].x, y: SERVICE_MAP[e.from].y }
        const to = { x: SERVICE_MAP[e.to].x, y: SERVICE_MAP[e.to].y }
        return { from, c: edgeControl(from, to, e.bow), to }
      }),
    [],
  )

  const particlesRef = React.useRef<{ e: number; t: number; sp: number }[]>([])
  const circleRefs = React.useRef<(SVGCircleElement | null)[]>([])
  const simRef = React.useRef(services)
  const runningRef = React.useRef(running)

  simRef.current = services
  runningRef.current = running

  if (particlesRef.current.length === 0) {
    const rng = mulberry32(1337)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({ e: Math.floor(rng() * EDGES.length), t: rng(), sp: 0.16 + rng() * 0.24 })
    }
  }

  React.useEffect(() => {
    const rng = mulberry32(0xc0ffee)
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 1000
      last = now
      if (runningRef.current) {
        const svc = simRef.current
        let total = 0
        for (const e of EDGES) total += svc[e.from]?.rps ?? 1
        const ps = particlesRef.current
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i]
          p.t += p.sp * dt
          if (p.t >= 1) {
            p.t -= 1
            let pick = rng() * total
            let chosen = 0
            for (let k = 0; k < EDGES.length; k++) {
              pick -= svc[EDGES[k].from]?.rps ?? 1
              if (pick <= 0) {
                chosen = k
                break
              }
            }
            p.e = chosen
            p.sp = 0.16 + rng() * 0.26
          }
          const g = geo[p.e]
          const pos = quadAt(g.from, g.c, g.to, p.t)
          const el = circleRefs.current[i]
          if (el) {
            const sev = worse(svc[EDGES[p.e].from]?.status ?? "healthy", svc[EDGES[p.e].to]?.status ?? "healthy")
            el.setAttribute("cx", pos.x.toFixed(1))
            el.setAttribute("cy", pos.y.toFixed(1))
            el.setAttribute("fill", PACKET_HEX[sev])
            el.setAttribute("r", sev === "healthy" ? "2.6" : "3.4")
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [geo])

  return (
    <svg
      viewBox={`0 0 ${MESH_VIEWBOX.w} ${MESH_VIEWBOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="block w-full"
      style={{ aspectRatio: `${MESH_VIEWBOX.w} / ${MESH_VIEWBOX.h}` }}
    >
      {/* arestas base + tinta de severidade */}
      {EDGES.map((e, i) => {
        const sev = worse(services[e.from]?.status ?? "healthy", services[e.to]?.status ?? "healthy")
        const d = edgePathD(geo[i].from, geo[i].c, geo[i].to)
        return (
          <g key={e.id}>
            <path d={d} fill="none" stroke="var(--border)" strokeWidth={2.4} strokeLinecap="round" />
            {sev !== "healthy" && (
              <path d={d} fill="none" stroke={STATUS_HEX[sev]} strokeWidth={3} strokeLinecap="round" opacity={0.28} />
            )}
          </g>
        )
      })}

      {/* pacotes de tráfego */}
      <g>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              circleRefs.current[i] = el
            }}
            cx={-10}
            cy={-10}
            r={2.6}
            fill={PACKET_HEX.healthy}
            opacity={incidentId ? 0.95 : 0.9}
          />
        ))}
      </g>

      {/* nós */}
      {SERVICES.map((s) => (
        <MeshNode
          key={s.id}
          id={s.id}
          selected={selectedId === s.id}
          status={services[s.id].status}
          rps={services[s.id].rps}
          p95={services[s.id].p95}
          onSelect={onSelect}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Golden signal card                                                 */
/* ------------------------------------------------------------------ */

function SignalCard({
  label,
  icon,
  value,
  hist,
  color,
  invert,
  window,
}: {
  label: string
  icon: React.ReactNode
  value: string
  hist: number[]
  color: string
  invert: boolean
  window: TimeWindow
}) {
  const tr = trendOf(hist)
  const up = tr >= 0
  const good = invert ? !up : up
  const trendClass = good ? "text-emerald-500" : "text-rose-500"
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight
  const pctBase = Math.abs(hist[hist.length - 7] ?? hist[0] ?? 1) || 1
  const pct = Math.abs(tr) / pctBase
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span style={{ color }}>{icon}</span>
          {label}
        </span>
        <span className={cn("flex items-center gap-0.5 tabular-nums", trendClass)}>
          <TrendIcon className="size-3" />
          {formatPct(pct, 1)}
        </span>
      </div>
      <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
      <Sparkline values={viewHist(hist, window)} color={color} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function ObservabilityCenter() {
  const [state, dispatch] = React.useReducer(reducer, undefined, buildInitialState)
  const {
    services,
    selectedId,
    incidentId,
    running,
    timeWindow,
    levels,
    logs,
    alerts,
    heatCols,
    trace,
    tick,
  } = state

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => dispatch({ type: "TICK" }), TICK_MS)
    return () => clearInterval(id)
  }, [running])

  const sel = services[selectedId]
  const selDef = SERVICE_MAP[selectedId]

  /* agregados globais */
  const totals = React.useMemo(() => {
    let rps = 0
    let weightedErr = 0
    let healthy = 0
    let degraded = 0
    let critical = 0
    let p95Sum = 0
    for (const s of SERVICES) {
      const r = services[s.id]
      rps += r.rps
      weightedErr += r.err * r.rps
      p95Sum += r.p95
      if (r.status === "healthy") healthy++
      else if (r.status === "degraded") degraded++
      else critical++
    }
    const errRate = weightedErr / (rps || 1)
    const score = clamp(100 - degraded * 7 - critical * 18 - errRate * 240, 0, 100)
    const availability = clamp(1 - errRate, 0, 1)
    const budgetUsed = clamp(errRate / 0.01, 0, 1)
    return {
      rps,
      errRate,
      healthy,
      degraded,
      critical,
      avgP95: p95Sum / SERVICES.length,
      score: Math.round(score),
      availability,
      budgetUsed,
    }
  }, [services])

  const globalStatus: ServiceStatus = totals.critical > 0 ? "critical" : totals.degraded > 0 ? "degraded" : "healthy"
  const scoreColor = STATUS_HEX[globalStatus]
  const firingCount = alerts.filter((a) => a.firing).length

  const visibleLogs = logs.filter((l) => levels[l.level])

  const logCounts = React.useMemo(() => {
    const counts: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 }
    for (const l of logs) counts[l.level]++
    return counts
  }, [logs])

  return (
    <div className="relative isolate flex flex-col bg-background text-foreground">
      {/* fundo decorativo sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 0%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 45%), radial-gradient(circle at 85% 8%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 40%)",
        }}
      />

      {/* ============================ TOPBAR ============================ */}
      <header className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Radio className="size-5" />
            {running && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500" />
              </span>
            )}
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Pulse</h2>
              <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px] font-medium">
                <Activity className="size-3" />
                {running ? "AO VIVO" : "PAUSADO"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Observability Command Center · {formatClock(tick)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* health chip */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: scoreColor }} />
            <span className="text-xs text-muted-foreground">Saúde</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: scoreColor }}>
              {totals.score}
            </span>
          </div>

          {/* window selector */}
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            {(["live", "5m", "1h"] as TimeWindow[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => dispatch({ type: "SET_WINDOW", window: w })}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  timeWindow === w
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {w === "live" ? "Live" : w}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant={running ? "outline" : "default"}
            size="sm"
            onClick={() => dispatch({ type: "TOGGLE_RUN" })}
          >
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pausar" : "Retomar"}
          </Button>

          <Button
            type="button"
            variant={incidentId ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "INJECT", id: selectedId })}
            className={cn(incidentId && "bg-rose-600 text-white hover:bg-rose-600/90")}
          >
            <Siren className="size-4" />
            {incidentId ? "Resolver incidente" : "Injetar incidente"}
          </Button>
        </div>
      </header>

      {/* incident banner */}
      {incidentId && (
        <div className="flex items-center gap-2 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
          <Siren className="size-4 shrink-0 animate-pulse" />
          <span className="font-medium">Incidente ativo em {SERVICE_MAP[incidentId].name}</span>
          <span className="text-rose-500/80">— degradação se propagando aos serviços dependentes.</span>
        </div>
      )}

      {/* ============================ GRID ============================ */}
      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-12">
        {/* ---- Mesh ---- */}
        <Panel
          title="Topologia de serviços"
          icon={<Workflow className="size-4" />}
          className="lg:col-span-8"
          right={
            <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
              {(Object.keys(KIND_META) as (keyof typeof KIND_META)[]).map((k) => {
                const M = KIND_META[k]
                return (
                  <span key={k} className="flex items-center gap-1">
                    <M.Icon className="size-3" />
                    {M.label}
                  </span>
                )
              })}
            </div>
          }
        >
          <div className="px-2 pb-2 pt-1">
            <ServiceMesh
              services={services}
              selectedId={selectedId}
              incidentId={incidentId}
              running={running}
              onSelect={(id) => dispatch({ type: "SELECT", id })}
            />
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-sky-400" /> tráfego
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> degradado
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" /> erro
              </span>
            </span>
            <span>Clique num serviço para inspecionar →</span>
          </div>
        </Panel>

        {/* ---- SLO / Health rail ---- */}
        <Panel
          title="SLO & saúde"
          icon={<Gauge className="size-4" />}
          className="lg:col-span-4"
          bodyClassName="flex flex-col gap-4 p-4"
        >
          <div className="flex items-center gap-4">
            <RadialGauge value={totals.availability} size={104} stroke={10} color={scoreColor}>
              <span className="text-lg font-bold tabular-nums" style={{ color: scoreColor }}>
                {formatPct(totals.availability, 2)}
              </span>
              <span className="text-[10px] text-muted-foreground">disponível</span>
            </RadialGauge>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {globalStatus === "healthy" ? (
                  <ShieldCheck className="size-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="size-4" style={{ color: scoreColor }} />
                )}
                <span>Sistema {STATUS_LABEL[globalStatus].toLowerCase()}</span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Error budget (30d)</span>
                  <span className="tabular-nums">{formatPct(totals.budgetUsed, 0)} usado</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(totals.budgetUsed * 100).toFixed(1)}%`,
                      backgroundColor: totals.budgetUsed > 0.7 ? STATUS_HEX.critical : totals.budgetUsed > 0.4 ? STATUS_HEX.degraded : STATUS_HEX.healthy,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border bg-background/40 p-2">
              <div className="text-base font-semibold tabular-nums text-emerald-500">{totals.healthy}</div>
              <div className="text-[10px] text-muted-foreground">saudáveis</div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-2">
              <div className="text-base font-semibold tabular-nums text-amber-500">{totals.degraded}</div>
              <div className="text-[10px] text-muted-foreground">degradados</div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-2">
              <div className="text-base font-semibold tabular-nums text-rose-500">{totals.critical}</div>
              <div className="text-[10px] text-muted-foreground">críticos</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-sky-400" /> Throughput global
            </span>
            <span className="text-sm font-semibold tabular-nums">
              <AnimatedNumber value={Math.round(totals.rps)} /> <span className="text-xs text-muted-foreground">rps</span>
            </span>
          </div>
        </Panel>

        {/* ---- Golden signals ---- */}
        <Panel
          title="Golden signals"
          icon={<Activity className="size-4" />}
          className="lg:col-span-12"
          right={
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", STATUS_CLASSES[sel.status].dot)} />
              <span className="text-xs font-medium text-foreground">{selDef.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                {WINDOW_LABEL[timeWindow]}
              </Badge>
            </div>
          }
          bodyClassName="grid grid-cols-2 gap-3 p-3 lg:grid-cols-4"
        >
          <SignalCard
            label="Latência p95"
            icon={<Clock className="size-3.5" />}
            value={formatMs(sel.p95)}
            hist={sel.histP95}
            color="#fb923c"
            invert
            window={timeWindow}
          />
          <SignalCard
            label="Throughput"
            icon={<Zap className="size-3.5" />}
            value={`${formatCompact(sel.rps)} rps`}
            hist={sel.histRps}
            color="#38bdf8"
            invert={false}
            window={timeWindow}
          />
          <SignalCard
            label="Taxa de erro"
            icon={<AlertTriangle className="size-3.5" />}
            value={formatPct(sel.err, 2)}
            hist={sel.histErr}
            color="#f43f5e"
            invert
            window={timeWindow}
          />
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-3.5 text-violet-400" /> Saturação
              </span>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>CPU</span>
                  <span className="tabular-nums">{formatPct(sel.cpu, 0)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(sel.cpu * 100).toFixed(0)}%`, backgroundColor: sel.cpu > 0.85 ? STATUS_HEX.critical : sel.cpu > 0.65 ? STATUS_HEX.degraded : "#a78bfa" }}
                  />
                </div>
                <div className="mb-1 mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Memória</span>
                  <span className="tabular-nums">{formatPct(sel.mem, 0)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(sel.mem * 100).toFixed(0)}%`, backgroundColor: sel.mem > 0.85 ? STATUS_HEX.critical : sel.mem > 0.65 ? STATUS_HEX.degraded : "#818cf8" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* ---- Heatmap ---- */}
        <Panel
          title="Heatmap de latência"
          icon={<Layers className="size-4" />}
          className="lg:col-span-7"
          right={<span className="text-[11px] text-muted-foreground">{selDef.name} · p95</span>}
          bodyClassName="p-4"
        >
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
              <span>lento</span>
              <span>rápido</span>
            </div>
            <div className="flex-1">
              <div
                className="grid gap-0.5"
                style={{ gridTemplateColumns: `repeat(${HEAT_COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: HEAT_ROWS }, (_, row) =>
                  heatCols.map((col, c) => (
                    <div
                      key={`${row}-${c}`}
                      className="aspect-square rounded-[2px]"
                      style={{ backgroundColor: heatColor(col[row]) }}
                    />
                  )),
                )}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>−{HEAT_COLS}t</span>
                <span>agora</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* ---- Trace waterfall ---- */}
        <Panel
          title="Distributed trace"
          icon={<Workflow className="size-4" />}
          className="lg:col-span-5"
          right={<span className="font-mono text-[11px] text-muted-foreground">#{(tick % 9000) + 1000}</span>}
          bodyClassName="flex flex-col gap-1.5 p-4"
        >
          {trace.map((span) => (
            <div key={span.id} className="flex items-center gap-2">
              <div className="w-24 shrink-0 truncate text-[11px] text-muted-foreground" style={{ paddingLeft: span.depth * 8 }}>
                {span.label}
              </div>
              <div className="relative h-4 flex-1 overflow-hidden rounded bg-muted/50">
                <div
                  className="absolute inset-y-0 rounded transition-all duration-500"
                  style={{
                    left: `${span.startPct}%`,
                    width: `${clamp(span.widthPct, 2, 100)}%`,
                    backgroundColor: STATUS_HEX[span.status],
                    opacity: 0.85,
                  }}
                />
              </div>
              <div className="w-12 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                {formatMs(span.ms)}
              </div>
            </div>
          ))}
          {trace.length <= 1 && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Serviço folha — sem dependências downstream.
            </p>
          )}
        </Panel>

        {/* ---- Log stream ---- */}
        <Panel
          title="Live log stream"
          icon={<Activity className="size-4" />}
          className="lg:col-span-7"
          right={
            <div className="flex items-center gap-1">
              {(["debug", "info", "warn", "error"] as LogLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => dispatch({ type: "TOGGLE_LEVEL", level: lvl })}
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tabular-nums transition-opacity",
                    LOG_LEVEL_CLASSES[lvl].chip,
                    !levels[lvl] && "opacity-35",
                  )}
                >
                  {lvl} {logCounts[lvl]}
                </button>
              ))}
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="h-[260px] overflow-y-auto px-2 py-1.5 font-mono text-[11px] leading-relaxed">
            {visibleLogs.length === 0 ? (
              <p className="px-2 py-6 text-center text-muted-foreground">Nenhum log no filtro atual.</p>
            ) : (
              visibleLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 rounded px-2 py-0.5 hover:bg-muted/40">
                  <span className="shrink-0 text-muted-foreground">{formatClock(log.t)}</span>
                  <span className={cn("w-10 shrink-0 font-semibold uppercase", LOG_LEVEL_CLASSES[log.level].text)}>
                    {log.level}
                  </span>
                  <span className="shrink-0 text-foreground/70">{SERVICE_MAP[log.service].short}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    <span className="text-foreground/80">{log.method}</span> {log.path}{" "}
                    <span className={log.status >= 500 ? "text-rose-400" : log.status >= 400 ? "text-amber-400" : "text-emerald-400"}>
                      {log.status}
                    </span>{" "}
                    · {log.ms}ms · {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* ---- Alerts ---- */}
        <Panel
          title="Alertas & incidentes"
          icon={<Siren className="size-4" />}
          className="lg:col-span-5"
          right={
            firingCount > 0 ? (
              <Badge className="gap-1 bg-rose-500/15 text-rose-500">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
                {firingCount} ativo{firingCount > 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-emerald-500">
                <CheckCircle2 className="size-3" /> tudo ok
              </Badge>
            )
          }
          bodyClassName="p-0"
        >
          <div className="h-[260px] overflow-y-auto p-2">
            {alerts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-6 text-emerald-500/60" />
                <p className="text-xs">Nenhum alerta disparado.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {alerts.map((a) => {
                  const sc = STATUS_CLASSES[a.severity === "critical" ? "critical" : "degraded"]
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2",
                        a.firing ? "border-border" : "border-border/60 opacity-70",
                      )}
                    >
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", sc.soft)}>
                        {a.firing ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {a.firing ? `disparado ${formatClock(a.t)}` : `resolvido ${formatClock(a.resolvedT ?? a.t)}`}
                        </p>
                      </div>
                      {a.firing &&
                        (a.acked ? (
                          <Badge variant="outline" className="text-[10px]">
                            reconhecido
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[11px]"
                            onClick={() => dispatch({ type: "ACK", id: a.id })}
                          >
                            Ack
                          </Button>
                        ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* ============================ STATUS BAR ============================ */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-2 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Server className="size-3.5" /> {SERVICES.length} serviços
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> {totals.healthy}
            <span className="size-2 rounded-full bg-amber-500" /> {totals.degraded}
            <span className="size-2 rounded-full bg-rose-500" /> {totals.critical}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="size-3.5" /> {formatCompact(totals.rps)} rps
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> p95 méd. {formatMs(totals.avgP95)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", running ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/50")} />
          {running ? "ingestão ativa" : "pausado"} · {formatClock(tick)}
        </div>
      </footer>
    </div>
  )
}
