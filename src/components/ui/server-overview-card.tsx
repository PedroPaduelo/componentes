/**
 * ServerOverviewCard — card denso de overview de UM servidor/container.
 *
 * Inspiração: New Relic / Datadog "Host Summary". Mostra tudo num único
 * bloco: status + uptime + host, dois gauges radiais (CPU + memória), lista
 * de discos com barra, rede + conexões em cards pequenos, top 5 processos
 * em tabela compacta, footer com região/zona + último incidente (se houver).
 *
 * Cores semânticas por status (TODAS fixas via Tailwind — não dependem de
 * tokens de tema):
 *   - online   → emerald-500
 *   - degraded → amber-500
 *   - offline  → rose-500
 *   - unknown  → gray-500
 *
 * O casco (borda, fundo, texto) usa tokens shadcn (bg-card / border-border /
 * text-foreground) — borda 1px visível em ambos os temas.
 *
 * Sparklines: SVG inline com 12 pontos, normalizados ao próprio range.
 * Renderizadas em <ServerOverviewCard data-...="..."> para que o Playwright
 * consiga contar e inspecionar via data-slot e data-points.
 *
 * Sem dependências novas. Layout responsivo 1 col em 390px, 2 cols em sm,
 * 3 cols em lg. PRNG local seedado (mulberry32) para gerar sparklines
 * default quando o caller não passa cpuHistory/memoryHistory.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type {
  ServerOverviewCardProps,
  ServerStatus,
  SparklinePoint,
} from "./server-overview-card-types"

/* ------------------------------------------------------------------ */
/*  PRNG determinístico (local — não importa de composition)          */
/* ------------------------------------------------------------------ */

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

function seedFor(input: string, salt: number): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h = (h ^ input.charCodeAt(i)) >>> 0
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return ((h ^ (salt * 0x85ebca77)) >>> 0) || 1
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/* ------------------------------------------------------------------ */
/*  Helpers de formatação                                              */
/* ------------------------------------------------------------------ */

function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const s = Math.floor(seconds)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatMb(mb: number): string {
  if (!Number.isFinite(mb)) return "—"
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb >= 10240 ? 0 : 1)} GB/s`
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB/s`
}

function formatRelative(iso: string | undefined): string {
  if (!iso) return "—"
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return "—"
  const diffSec = Math.max(0, (Date.now() - t) / 1000)
  if (diffSec < 60) return "agora"
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)} min`
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)} h`
  const d = Math.floor(diffSec / 86400)
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`
  return new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

/* ------------------------------------------------------------------ */
/*  Cores e classes por status (fixas)                                 */
/* ------------------------------------------------------------------ */

const STATUS_TEXT: Record<ServerStatus, string> = {
  online: "text-emerald-500",
  degraded: "text-amber-500",
  offline: "text-rose-500",
  unknown: "text-gray-500",
}

const STATUS_BG: Record<ServerStatus, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-rose-500",
  unknown: "bg-gray-500",
}

const STATUS_BG_SOFT: Record<ServerStatus, string> = {
  online: "bg-emerald-500/15",
  degraded: "bg-amber-500/15",
  offline: "bg-rose-500/15",
  unknown: "bg-gray-500/15",
}

const STATUS_LABEL: Record<ServerStatus, string> = {
  online: "online",
  degraded: "degradado",
  offline: "offline",
  unknown: "desconhecido",
}

const STATUS_HEX: Record<ServerStatus, string> = {
  online: "#10b981",
  degraded: "#f59e0b",
  offline: "#f43f5e",
  unknown: "#6b7280",
}

/* ------------------------------------------------------------------ */
/*  RadialGauge 270° (helper local)                                    */
/* ------------------------------------------------------------------ */

function RadialGauge({
  value,
  size,
  stroke,
  color,
  children,
}: {
  /** 0..1 */
  value: number
  size: number
  stroke: number
  color: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  // 270° de arco → 0.75 da circunferência
  const arc = 0.75
  const dashTrack = `${(c * arc).toFixed(2)} ${c.toFixed(2)}`
  const dashVal = `${(c * arc * clamp(value, 0, 1)).toFixed(2)} ${c.toFixed(2)}`
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
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
            style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 5px ${color})` }}
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
/*  Sparkline SVG (12 pontos)                                          */
/* ------------------------------------------------------------------ */

function Sparkline({
  values,
  color,
  label,
}: {
  values: SparklinePoint[]
  color: string
  label: string
}) {
  const W = 132
  const H = 36
  const pad = 3
  if (values.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-9 w-full"
        role="img"
        aria-label={label}
      />
    )
  }
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
  const lastY = pad + (H - pad * 2) * (1 - (values[values.length - 1] - min) / span)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-9 w-full"
      role="img"
      aria-label={label}
      data-points={values.length}
    >
      <path d={`${line} L ${lastX.toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`} fill={color} opacity={0.14} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={lastX}
        cy={lastY}
        r={2.2}
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

function ServerOverviewCard({
  server,
  showSparklines = true,
  className,
  ...props
}: ServerOverviewCardProps) {
  /* -------- derivações determinísticas -------- */
  const seed = React.useMemo(() => seedFor(server.id, 1), [server.id])
  const rng = React.useMemo(() => mulberry32(seed), [seed])

  const cpuHistory = React.useMemo<SparklinePoint[]>(
    () => server.cpuHistory ?? defaultHistory(rng, 12, server.cpu.usagePct),
    [server.cpuHistory, server.cpu.usagePct, rng],
  )
  const memHistory = React.useMemo<SparklinePoint[]>(
    () => server.memoryHistory ?? defaultHistory(rng, 12, server.memory.usedPct),
    [server.memoryHistory, server.memory.usedPct, rng],
  )
  const netInHistory = React.useMemo<SparklinePoint[]>(
    () => server.netInHistory ?? defaultHistory(rng, 12, server.network.inMBs),
    [server.netInHistory, server.network.inMBs, rng],
  )
  const netOutHistory = React.useMemo<SparklinePoint[]>(
    () => server.netOutHistory ?? defaultHistory(rng, 12, server.network.outMBs),
    [server.netOutHistory, server.network.outMBs, rng],
  )

  const status = server.status
  const accent = STATUS_HEX[status]
  const cpuColor = colorForUsage(server.cpu.usagePct)
  const memColor = colorForUsage(server.memory.usedPct)

  return (
    <div
      data-slot="server-overview-card"
      data-server-id={server.id}
      data-server-status={status}
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
        "sm:p-5",
        className,
      )}
      {...props}
    >
      {/* ============================ HEADER ============================ */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex size-2.5 shrink-0">
              <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", STATUS_BG[status])} />
              <span className={cn("relative inline-flex size-2.5 rounded-full", STATUS_BG[status])} />
            </span>
            <h3 className="truncate text-base font-semibold text-foreground">{server.name}</h3>
            <Badge
              variant="outline"
              data-server-status={status}
              className={cn(
                "border-current px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide",
                STATUS_TEXT[status],
              )}
            >
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {server.host}
            <span className="mx-1.5 text-border">·</span>
            <span className="text-foreground/80">{server.role}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">uptime</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {formatUptime(server.uptimeSeconds)}
          </span>
        </div>
      </header>

      {/* ============================ GAUGES ============================ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* CPU */}
        <div
          data-section="cpu"
          className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3"
        >
          <RadialGauge value={server.cpu.usagePct / 100} size={92} stroke={9} color={cpuColor}>
            <span className="text-base font-bold tabular-nums text-foreground">
              {server.cpu.usagePct.toFixed(0)}%
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">cpu</span>
          </RadialGauge>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                CPU · {server.cpu.cores} cores
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                load {server.cpu.loadAvg.map((v) => v.toFixed(1)).join("/")}
              </span>
            </div>
            {showSparklines && (
              <div className="mt-1.5">
                <Sparkline values={cpuHistory} color={cpuColor} label="Histórico de CPU (12 amostras)" />
              </div>
            )}
          </div>
        </div>

        {/* Memória */}
        <div
          data-section="memory"
          className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3"
        >
          <RadialGauge value={server.memory.usedPct / 100} size={92} stroke={9} color={memColor}>
            <span className="text-base font-bold tabular-nums text-foreground">
              {server.memory.usedGB.toFixed(1)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              / {server.memory.totalGB.toFixed(0)} GB
            </span>
          </RadialGauge>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Memória · {server.memory.usedPct.toFixed(0)}%
              </span>
              {typeof server.memory.swapUsedPct === "number" && (
                <span
                  data-section="swap"
                  className={cn(
                    "font-mono text-[10px]",
                    server.memory.swapUsedPct > 20 ? "text-amber-500" : "text-muted-foreground",
                  )}
                >
                  swap {server.memory.swapUsedPct.toFixed(0)}%
                </span>
              )}
            </div>
            {showSparklines && (
              <div className="mt-1.5">
                <Sparkline values={memHistory} color={memColor} label="Histórico de memória (12 amostras)" />
              </div>
            )}
            {typeof server.memory.swapUsedPct === "number" && server.memory.swapUsedPct > 0 && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    server.memory.swapUsedPct > 60 ? "bg-rose-500" : server.memory.swapUsedPct > 20 ? "bg-amber-500" : "bg-emerald-500",
                  )}
                  style={{ width: `${clamp(server.memory.swapUsedPct, 0, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================ DISKS ============================ */}
      <section data-section="disks" className="flex flex-col gap-2">
        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-foreground/30" />
          Discos
        </h4>
        <div className="flex flex-col gap-2">
          {server.disks.map((d) => {
            const diskColor = colorForUsage(d.usedPct)
            return (
              <div
                key={d.mount}
                data-disk-mount={d.mount}
                className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background/30 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-mono text-foreground/90">{d.mount}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {d.usedGB.toFixed(0)} / {d.totalGB.toFixed(0)} GB
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${clamp(d.usedPct, 0, 100)}%`, backgroundColor: diskColor }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                  <span className="font-medium tabular-nums text-foreground/70">
                    {d.usedPct.toFixed(0)}%
                  </span>
                  <span className="font-mono tabular-nums">↓ {formatMb(d.readMBs)}</span>
                  <span className="font-mono tabular-nums">↑ {formatMb(d.writeMBs)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================ NETWORK ============================ */}
      <section
        data-section="network"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <div data-net="in" className="flex flex-col gap-1 rounded-md border border-border/60 bg-background/30 p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">net in</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            ↓ {formatMb(server.network.inMBs)}
          </span>
          {showSparklines && (
            <Sparkline values={netInHistory} color="#38bdf8" label="Histórico net in" />
          )}
        </div>
        <div data-net="out" className="flex flex-col gap-1 rounded-md border border-border/60 bg-background/30 p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">net out</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            ↑ {formatMb(server.network.outMBs)}
          </span>
          {showSparklines && (
            <Sparkline values={netOutHistory} color="#a78bfa" label="Histórico net out" />
          )}
        </div>
        <div data-net="connections" className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-background/30 p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">conexões</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {server.network.connectionsCount}
          </span>
          <span className="text-[10px] text-muted-foreground">total</span>
        </div>
        <div data-net="established" className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-background/30 p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">estabelecidas</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-emerald-500">
            {server.network.establishedCount}
          </span>
          <span className="text-[10px] text-muted-foreground">ESTABLISHED</span>
        </div>
      </section>

      {/* ============================ PROCESSES ============================ */}
      <section data-section="processes" className="flex flex-col gap-2">
        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-foreground/30" />
          Top processos ({server.processes.length})
        </h4>
        <div className="overflow-hidden rounded-md border border-border/60">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-14 px-2 py-1.5 text-left font-medium">PID</th>
                <th className="px-2 py-1.5 text-left font-medium">processo</th>
                <th className="w-16 px-2 py-1.5 text-right font-medium">CPU</th>
                <th className="w-16 px-2 py-1.5 text-right font-medium">mem</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {server.processes.map((p) => (
                <tr
                  key={`${p.pid}-${p.name}`}
                  data-process-pid={p.pid}
                  data-process-name={p.name}
                  className="border-t border-border/40"
                >
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{p.pid}</td>
                  <td className="min-w-0 px-2 py-1.5">
                    <span className="font-sans font-medium text-foreground">{p.name}</span>
                    {p.command && (
                      <span
                        data-process-command
                        className="ml-1.5 hidden truncate text-[10px] text-muted-foreground sm:inline"
                      >
                        {p.command.length > 48 ? `${p.command.slice(0, 45)}…` : p.command}
                      </span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right tabular-nums",
                      p.cpuPct > 70 ? "text-rose-500" : p.cpuPct > 40 ? "text-amber-500" : "text-foreground/80",
                    )}
                  >
                    {p.cpuPct.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right tabular-nums",
                      p.memPct > 30 ? "text-rose-500" : p.memPct > 15 ? "text-amber-500" : "text-foreground/80",
                    )}
                  >
                    {p.memPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer
        data-section="footer"
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-[10px] text-muted-foreground",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {server.region && (
            <span className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-foreground/30" />
              <span className="font-medium uppercase tracking-wider text-foreground/70">região</span>
              <span className="font-mono normal-case text-foreground/80">{server.region}</span>
            </span>
          )}
          {server.zone && (
            <span className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-foreground/30" />
              <span className="font-medium uppercase tracking-wider text-foreground/70">zona</span>
              <span className="font-mono normal-case text-foreground/80">{server.zone}</span>
            </span>
          )}
        </div>
        <div
          data-section="last-incident"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-0.5",
            STATUS_BG_SOFT[status],
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", STATUS_BG[status])}
            style={{ boxShadow: `0 0 4px ${accent}` }}
          />
          <span className="text-foreground/80">último incidente · {formatRelative(server.lastIncidentAt)}</span>
        </div>
      </footer>
    </div>
  )
}

function colorForUsage(pct: number): string {
  if (pct >= 85) return STATUS_HEX.offline
  if (pct >= 65) return STATUS_HEX.degraded
  return STATUS_HEX.online
}

function defaultHistory(
  rng: () => number,
  n: number,
  baseValue: number,
): SparklinePoint[] {
  // gera `n` pontos numa janela centrada em baseValue (±20%), clamp >= 0
  const amp = Math.max(2, baseValue * 0.18)
  const arr: number[] = []
  for (let i = 0; i < n; i++) {
    const jitter = (rng() - 0.5) * 2 * amp
    arr.push(Math.max(0, baseValue + jitter))
  }
  return arr
}

export { ServerOverviewCard }
export type { ServerMetrics, ServerOverviewCardProps } from "./server-overview-card-types"
