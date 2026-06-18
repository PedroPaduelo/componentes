/**
 * Composição "Observability Command Center" (Pulse).
 *
 * Um centro de comando de observabilidade VIVO e CINEMATOGRÁFICO — longe do
 * grid de gráficos estáticos do Grafana. Camadas de "dopamina" sem perder a
 * densidade de gestão:
 *  - Boot sequence (scanline) ao montar;
 *  - ECG hero strip: o "batimento" do sistema varrendo o topo com glow neon,
 *    acelerando/arritmando sob stress (faz jus ao nome Pulse);
 *  - Service mesh turbinado: nós com glow, radar pings, arestas com fluxo
 *    tracejado e PACOTES de request fluindo em tempo real (SVG + rAF) com
 *    cauda de cometa, coloridos por severidade;
 *  - War Room takeover no incidente: vinheta vermelha pulsante + onda de
 *    choque irradiando do nó com falha aos dependentes;
 *  - Golden signals, heatmap, trace waterfall, SLO, log stream e alertas.
 *
 * Tudo dirigido por um relógio simulado determinístico (PRNG seedado pelo
 * tick — zero Math.random). Casco em tokens shadcn (tema light/dark reativo);
 * cores de status/heatmap são severidade/data-viz.
 *
 * Componentização: o ECG, a sparkline (via SignalCard), o gauge radial, o
 * card-shell (DashboardPanel com glow), o cartão de golden signal, a malha de
 * serviços (ServiceMesh), o stream de logs (LogStream) e a cascata de trace
 * (TraceWaterfall) foram extraídos para componentes registrados
 * (`@/components/ui/*`) e são reusados aqui — esta composição só orquestra a
 * simulação e o layout (incluindo a grade-heatmap, ainda acoplada à janela
 * rolante do tick).
 */

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Gauge,
  Globe,
  HeartPulse,
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
import { DashboardPanel } from "@/components/ui/dashboard-panel"
import { EcgStrip } from "@/components/ui/ecg-strip"
import { LogStream } from "@/components/ui/log-stream"
import { RadialGauge } from "@/components/ui/radial-gauge"
import { ServiceMesh } from "@/components/ui/service-mesh"
import { SignalCard } from "@/components/ui/signal-card"
import { TraceWaterfall } from "@/components/ui/trace-waterfall"
import {
  CONSUMERS_OF,
  DOWNSTREAM_OF,
  EDGES,
  HTTP_METHODS,
  LOG_MESSAGES,
  LOG_PATHS,
  MESH_VIEWBOX,
  PACKET_HEX,
  SERVICE_MAP,
  SERVICES,
  STATUS_CLASSES,
  STATUS_HEX,
  STATUS_LABEL,
  clamp,
  formatClock,
  formatCompact,
  formatMs,
  formatPct,
  heatColor,
  mulberry32,
  seedFor,
  type AlertItem,
  type LogEntry,
  type LogLevel,
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

/** Variação relativa (fração assinada) entre o último ponto e 7 ticks atrás. */
function trendFraction(hist: number[]): number {
  if (hist.length < 7) return 0
  const prev = hist[hist.length - 7]
  const base = Math.abs(prev || hist[0] || 1) || 1
  return (hist[hist.length - 1] - prev) / base
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

  const [booting, setBooting] = React.useState(true)
  const [bootFill, setBootFill] = React.useState(false)

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setBootFill(true))
    const id = setTimeout(() => setBooting(false), 2100)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(id)
    }
  }, [])

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
  const stress = clamp((100 - totals.score) / 100 + totals.errRate * 4, 0, 1)
  const firingCount = alerts.filter((a) => a.firing).length

  /* nós da malha (mapeia o runtime simulado → props genéricas do ServiceMesh) */
  const meshNodes = React.useMemo(
    () =>
      SERVICES.map((s) => {
        const r = services[s.id]
        return {
          id: s.id,
          label: s.name,
          x: s.x,
          y: s.y,
          status: r.status,
          weight: r.rps,
          meta: `${formatCompact(r.rps)} rps · ${formatMs(r.p95)}`,
        }
      }),
    [services],
  )

  return (
    <div className="relative isolate flex flex-col overflow-hidden bg-background text-foreground">
      {/* fundo cinematográfico reativo ao status */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% -10%, color-mix(in oklab, ${scoreColor} 16%, transparent), transparent 45%), radial-gradient(circle at 88% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 42%), linear-gradient(color-mix(in oklab, var(--foreground) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 4%, transparent) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 100% 100%, 46px 46px, 46px 46px",
          transition: "background-image 0.8s ease",
        }}
      />

      {/* war room: vinheta vermelha pulsante */}
      {incidentId && (
        <div
          aria-hidden
          className="obs-vignette pointer-events-none absolute inset-0 z-20"
          style={{ boxShadow: "inset 0 0 130px 10px color-mix(in oklab, #f43f5e 55%, transparent)" }}
        />
      )}

      {/* ============================ TOPBAR ============================ */}
      <header className="relative z-10 flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
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
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }} />
            <span className="text-xs text-muted-foreground">Saúde</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: scoreColor }}>
              {totals.score}
            </span>
          </div>

          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            {(["live", "5m", "1h"] as TimeWindow[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => dispatch({ type: "SET_WINDOW", window: w })}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  timeWindow === w ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {w === "live" ? "Live" : w}
              </button>
            ))}
          </div>

          <Button type="button" variant={running ? "outline" : "default"} size="sm" onClick={() => dispatch({ type: "TOGGLE_RUN" })}>
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

      {/* ============================ ECG HERO ============================ */}
      <div className="relative z-10 flex items-center gap-4 border-b border-border bg-card/40 px-4 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <HeartPulse className="size-5" style={{ color: scoreColor }} />
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sinal do sistema</div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: scoreColor }}>
              {STATUS_LABEL[globalStatus]}
            </div>
          </div>
        </div>
        <div className="h-12 min-w-0 flex-1">
          <EcgStrip
            color={scoreColor}
            amplitude={24 + stress * 12}
            speed={1 + stress * 1.2}
            paused={!running}
            className="h-full w-full"
          />
        </div>
        <div className="hidden shrink-0 flex-col items-end leading-tight sm:flex">
          <div className="text-base font-bold tabular-nums text-foreground">
            <AnimatedNumber value={Math.round(totals.rps)} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">requests / s</div>
        </div>
      </div>

      {/* incident banner */}
      {incidentId && (
        <div className="relative z-10 flex items-center gap-2 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
          <Siren className="size-4 shrink-0 animate-pulse" />
          <span className="font-medium">Incidente ativo em {SERVICE_MAP[incidentId].name}</span>
          <span className="text-rose-500/80">— degradação se propagando aos serviços dependentes.</span>
        </div>
      )}

      {/* ============================ GRID ============================ */}
      <div className="relative z-10 grid grid-cols-1 gap-3 p-3 lg:grid-cols-12">
        {/* ---- Mesh ---- */}
        <DashboardPanel
          variant="framed"
          title="Topologia de serviços"
          icon={<Workflow className="size-4" />}
          className="lg:col-span-8"
          glow
          action={
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
              nodes={meshNodes}
              edges={EDGES}
              width={MESH_VIEWBOX.w}
              height={MESH_VIEWBOX.h}
              selectedId={selectedId}
              pingIds={incidentId ? [incidentId] : undefined}
              paused={!running}
              particleCount={76}
              statusColors={STATUS_HEX}
              packetColors={PACKET_HEX}
              statusLabels={STATUS_LABEL}
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
        </DashboardPanel>

        {/* ---- SLO / Health rail ---- */}
        <DashboardPanel
          variant="framed"
          title="SLO & saúde"
          icon={<Gauge className="size-4" />}
          className="lg:col-span-4"
          glow
          bodyClassName="flex flex-col gap-4 p-4"
        >
          <div className="flex items-center gap-4">
            <RadialGauge value={totals.availability} max={1} size={108} thickness={11} color={scoreColor}>
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
        </DashboardPanel>

        {/* ---- Golden signals ---- */}
        <DashboardPanel
          variant="framed"
          title="Golden signals"
          icon={<Activity className="size-4" />}
          className="lg:col-span-12"
          action={
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
            data={viewHist(sel.histP95, timeWindow)}
            trend={trendFraction(sel.histP95)}
            trendPolarity="up-bad"
            tone="amber"
          />
          <SignalCard
            label="Throughput"
            icon={<Zap className="size-3.5" />}
            value={formatCompact(sel.rps)}
            unit="rps"
            data={viewHist(sel.histRps, timeWindow)}
            trend={trendFraction(sel.histRps)}
            trendPolarity="up-good"
            tone="sky"
          />
          <SignalCard
            label="Taxa de erro"
            icon={<AlertTriangle className="size-3.5" />}
            value={formatPct(sel.err, 2)}
            data={viewHist(sel.histErr, timeWindow)}
            trend={trendFraction(sel.histErr)}
            trendPolarity="up-bad"
            tone="rose"
          />
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-3.5 text-violet-400" /> Saturação
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>CPU</span>
                <span className="tabular-nums">{formatPct(sel.cpu, 0)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sel.cpu * 100).toFixed(0)}%`, backgroundColor: sel.cpu > 0.85 ? STATUS_HEX.critical : sel.cpu > 0.65 ? STATUS_HEX.degraded : "#a78bfa" }} />
              </div>
              <div className="mb-1 mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Memória</span>
                <span className="tabular-nums">{formatPct(sel.mem, 0)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sel.mem * 100).toFixed(0)}%`, backgroundColor: sel.mem > 0.85 ? STATUS_HEX.critical : sel.mem > 0.65 ? STATUS_HEX.degraded : "#818cf8" }} />
              </div>
            </div>
          </div>
        </DashboardPanel>

        {/* ---- Heatmap (grade acoplada à janela rolante do tick) ---- */}
        <DashboardPanel variant="framed" title="Heatmap de latência" icon={<Layers className="size-4" />} className="lg:col-span-7" action={<span className="text-[11px] text-muted-foreground">{selDef.name} · p95</span>} bodyClassName="p-4">
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
              <span>lento</span>
              <span>rápido</span>
            </div>
            <div className="flex-1">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${HEAT_COLS}, minmax(0, 1fr))` }}>
                {Array.from({ length: HEAT_ROWS }, (_, row) =>
                  heatCols.map((col, c) => (
                    <div key={`${row}-${c}`} className="aspect-square rounded-[2px]" style={{ backgroundColor: heatColor(col[row]) }} />
                  )),
                )}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>−{HEAT_COLS}t</span>
                <span>agora</span>
              </div>
            </div>
          </div>
        </DashboardPanel>

        {/* ---- Trace waterfall ---- */}
        <DashboardPanel variant="framed" title="Distributed trace" icon={<Workflow className="size-4" />} className="lg:col-span-5" action={<span className="font-mono text-[11px] text-muted-foreground">#{(tick % 9000) + 1000}</span>} bodyClassName="p-4">
          <TraceWaterfall
            total={100}
            statusColors={STATUS_HEX}
            leafLabel="Serviço folha — sem dependências downstream."
            spans={trace.map((span) => ({
              id: span.id,
              label: span.label,
              start: span.startPct,
              duration: span.widthPct,
              status: span.status,
              depth: span.depth,
              valueLabel: formatMs(span.ms),
            }))}
          />
        </DashboardPanel>

        {/* ---- Log stream ---- */}
        <DashboardPanel
          variant="framed"
          title="Live log stream"
          icon={<Activity className="size-4" />}
          className="lg:col-span-7"
          bodyClassName="p-0"
        >
          <LogStream
            className="h-[304px]"
            levels={levels}
            onToggleLevel={(lvl) => dispatch({ type: "TOGGLE_LEVEL", level: lvl as LogLevel })}
            entries={logs.map((log) => ({
              id: log.id,
              level: log.level,
              time: formatClock(log.t),
              service: SERVICE_MAP[log.service].short,
              method: log.method,
              path: log.path,
              code: log.status,
              ms: log.ms,
              message: log.message,
            }))}
          />
        </DashboardPanel>

        {/* ---- Alerts ---- */}
        <DashboardPanel
          variant="framed"
          title="Alertas & incidentes"
          icon={<Siren className="size-4" />}
          className="lg:col-span-5"
          action={
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
                    <div key={a.id} className={cn("obs-rise flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2", a.firing ? "border-border" : "border-border/60 opacity-70")}>
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", sc.soft)}>
                        {a.firing ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground">{a.firing ? `disparado ${formatClock(a.t)}` : `resolvido ${formatClock(a.resolvedT ?? a.t)}`}</p>
                      </div>
                      {a.firing &&
                        (a.acked ? (
                          <Badge variant="outline" className="text-[10px]">reconhecido</Badge>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => dispatch({ type: "ACK", id: a.id })}>
                            Ack
                          </Button>
                        ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DashboardPanel>
      </div>

      {/* ============================ STATUS BAR ============================ */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-2 text-[11px] text-muted-foreground">
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

      {/* ============================ BOOT SEQUENCE ============================ */}
      {booting && (
        <div className="obs-boot-fade absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px obs-scanline" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 80%, transparent), transparent)", boxShadow: "0 0 12px 2px color-mix(in oklab, var(--primary) 60%, transparent)" }} />
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Radio className="size-6 animate-pulse" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-[0.3em] text-foreground">PULSE</div>
              <div className="font-mono text-[11px] text-muted-foreground">inicializando telemetria…</div>
            </div>
          </div>
          <div className="mt-5 h-1 w-56 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full w-full rounded-full bg-primary"
              style={{
                transformOrigin: "left",
                transform: bootFill ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 1.4s ease",
                boxShadow: "0 0 10px var(--primary)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
