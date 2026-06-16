/**
 * ContainerResourcePanel — Painel de recursos de UM container Docker.
 *
 * Read-only view de `ContainerMetrics` (vide `container-resource-panel-types`).
 * Inspirado em Portainer / Docker Desktop: status + health + CPU/MEM com
 * limites + portas + restart count + network + block I/O + env + mounts.
 *
 * Cores reativas ao status via `data-status` (emerald/sky/amber/rose/gray) —
 * permite reagir a dark mode sem seletor adicional (a cor é o mesmo Tailwind
 * utility, que vira via tokens shadcn em ambos os temas).
 *
 * Zero dívida técnica:
 *  - Named export único, sem default, sem "use client".
 *  - Sem `as any` / `@ts-ignore` / `eslint-disable` / `console.*` / `TODO`.
 *  - Sem classes Tailwind interpoladas — todas literais.
 *  - Sem dependências novas; sem PRNG (dados prontos do prop).
 *  - Sem re-exports adicionais (types no arquivo -types, re-exportados no barrel).
 */

import * as React from "react"
import { Activity, Container as ContainerIcon, Cpu, HardDrive, Network, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ContainerMetrics } from "@/components/ui/container-resource-panel-types"

export type ContainerResourcePanelProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  container: ContainerMetrics
  /** Quantos env vars mostrar antes do botão "ver mais". Default 8. */
  maxEnvVisible?: number
}

/* -------------------------------------------------------------------------- */
/*                                helpers                                    */
/* -------------------------------------------------------------------------- */

const STATUS_LABEL: Record<ContainerMetrics["status"], string> = {
  running: "Running",
  exited: "Exited",
  restarting: "Restarting",
  paused: "Paused",
  dead: "Dead",
  created: "Created",
}

const HEALTH_LABEL: Record<ContainerMetrics["health"], string> = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  starting: "Starting",
  none: "—",
}

/** Cor base do status (chip + dot). Classes Tailwind literais (sem interpolação). */
const STATUS_TONE: Record<
  ContainerMetrics["status"],
  { chip: string; dot: string; text: string }
> = {
  running: {
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  restarting: {
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  paused: {
    chip: "border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300",
    dot: "bg-gray-500",
    text: "text-gray-700 dark:text-gray-300",
  },
  exited: {
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
  dead: {
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
  created: {
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
  },
}

/** Cor do badge de health (independente do status; só pinta quando !== "none"). */
const HEALTH_TONE: Record<ContainerMetrics["health"], string> = {
  healthy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  unhealthy: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  starting: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  none: "border-border bg-muted text-muted-foreground",
}

/** Cor do badge de restart count. */
function restartTone(count: number): string {
  if (count === 0) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (count <= 3) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
}

/** Cor da barra de CPU baseada no uso. */
function cpuBarTone(usagePct: number): string {
  if (usagePct >= 90) return "bg-rose-500"
  if (usagePct >= 70) return "bg-amber-500"
  return "bg-emerald-500"
}

/** Cor da barra de MEM baseada no uso. */
function memBarTone(usagePct: number): string {
  if (usagePct >= 90) return "bg-rose-500"
  if (usagePct >= 75) return "bg-amber-500"
  return "bg-sky-500"
}

/** Formata uptime em "Xd Yh Zm" (segundos -> string). */
function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${Math.max(0, Math.floor(seconds))}s`
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}

/* -------------------------------------------------------------------------- */
/*                             sub-componentes                                */
/* -------------------------------------------------------------------------- */

function StatusChip({ status }: { status: ContainerMetrics["status"] }) {
  const tone = STATUS_TONE[status]
  return (
    <span
      data-slot="container-status-chip"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        tone.chip,
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", tone.dot)} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}

function HealthBadge({ health }: { health: ContainerMetrics["health"] }) {
  if (health === "none") return null
  return (
    <span
      data-slot="container-health-badge"
      data-health={health}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
        HEALTH_TONE[health],
      )}
    >
      {HEALTH_LABEL[health]}
    </span>
  )
}

function MiniCard({
  label,
  value,
  sub,
  icon: Icon,
  testid,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  testid: string
}) {
  return (
    <div
      data-slot="container-mini-card"
      data-resource={testid}
      className="rounded-md border border-border bg-card p-2.5"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums text-foreground">{value}</div>
      {sub ? <div className="text-xs text-muted-foreground tabular-nums">{sub}</div> : null}
    </div>
  )
}

function Bar({
  label,
  pct,
  caption,
  fillClassName,
}: {
  label: string
  pct: number
  caption: string
  fillClassName: string
}) {
  const w = clampPct(pct)
  return (
    <div data-slot="container-bar" data-bar-label={label}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{caption}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", fillClassName)}
          style={{ width: `${w}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               componente                                   */
/* -------------------------------------------------------------------------- */

function ContainerResourcePanel({
  container,
  maxEnvVisible = 8,
  className,
  ...props
}: ContainerResourcePanelProps) {
  const [showAllEnv, setShowAllEnv] = React.useState(false)

  const memPct = container.memory.limitMB > 0
    ? (container.memory.usageMB / container.memory.limitMB) * 100
    : 0
  const memPctClamped = clampPct(memPct)
  const cpuPct = clampPct(container.cpu.usagePct)
  const envToShow = showAllEnv ? container.env : container.env.slice(0, maxEnvVisible)
  const hasMoreEnv = container.env.length > maxEnvVisible

  const statusTone = STATUS_TONE[container.status]

  return (
    <div
      data-slot="container-resource-panel"
      data-status={container.status}
      data-health={container.health}
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border bg-card text-foreground",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div
        data-slot="container-header"
        className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ContainerIcon className={cn("size-4 shrink-0", statusTone.text)} aria-hidden />
          <span className="truncate text-sm font-semibold" title={container.name}>
            {container.name}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">·</span>
          <span className="hidden truncate text-xs text-muted-foreground sm:inline" title={container.id}>
            {container.id.slice(0, 12)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusChip status={container.status} />
          <HealthBadge health={container.health} />
          <span
            data-slot="container-uptime"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-xs text-muted-foreground tabular-nums"
          >
            up {formatUptime(container.uptimeSeconds)}
          </span>
        </div>
      </div>

      {/* Image / dates */}
      <div
        data-slot="container-meta"
        className="flex flex-col gap-1 border-b border-border px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3"
      >
        <span className="truncate">
          <span className="text-foreground/70">image:</span> {container.image}:{container.tag}
        </span>
        <span className="hidden sm:inline">·</span>
        <span>started {container.startedAt}</span>
        {container.finishedAt ? (
          <>
            <span className="hidden sm:inline">·</span>
            <span>finished {container.finishedAt}</span>
          </>
        ) : null}
      </div>

      {/* Mini-cards: CPU / MEM / NET / DISK */}
      <div
        data-slot="container-resource-grid"
        className="grid grid-cols-2 gap-2 border-b border-border p-3 lg:grid-cols-4"
      >
        <MiniCard
          label="CPU"
          value={`${cpuPct.toFixed(1)}%`}
          sub={`/ ${container.cpu.limitCores} cores${
            typeof container.cpu.throttledPct === "number"
              ? ` · ${container.cpu.throttledPct.toFixed(1)}% throttled`
              : ""
          }`}
          icon={Cpu}
          testid="cpu"
        />
        <MiniCard
          label="Memory"
          value={`${container.memory.usageMB} MB`}
          sub={`/ ${container.memory.limitMB} MB · ${container.memory.cacheMB} MB cache`}
          icon={Activity}
          testid="memory"
        />
        <MiniCard
          label="Network"
          value={`${container.network.rxMB} / ${container.network.txMB} MB`}
          sub="rx / tx"
          icon={Network}
          testid="network"
        />
        <MiniCard
          label="Disk I/O"
          value={`${container.blockIO.readMB} / ${container.blockIO.writeMB} MB`}
          sub="read / write"
          icon={HardDrive}
          testid="disk"
        />
      </div>

      {/* Barras: CPU vs limitCores | MEM vs limitMB */}
      <div
        data-slot="container-bars"
        className="grid grid-cols-1 gap-3 border-b border-border p-3 md:grid-cols-2"
      >
        <Bar
          label="CPU usage"
          pct={cpuPct}
          caption={`${cpuPct.toFixed(1)}% / 100%`}
          fillClassName={cpuBarTone(cpuPct)}
        />
        <Bar
          label="Memory usage"
          pct={memPctClamped}
          caption={`${container.memory.usageMB} / ${container.memory.limitMB} MB (${memPctClamped.toFixed(1)}%)`}
          fillClassName={memBarTone(memPctClamped)}
        />
      </div>

      {/* Restart count + ports */}
      <div
        data-slot="container-restart-ports"
        className="grid grid-cols-1 gap-3 border-b border-border p-3 md:grid-cols-[auto_1fr] md:items-start"
      >
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">Restarts</div>
          <span
            data-slot="container-restart-badge"
            data-restart-count={container.restartCount}
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-sm font-semibold tabular-nums",
              restartTone(container.restartCount),
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {container.restartCount}
            {typeof container.restartLimit === "number" ? (
              <span className="text-xs font-normal opacity-80">/ {container.restartLimit}</span>
            ) : null}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs text-muted-foreground">Ports</div>
          {container.ports.length === 0 ? (
            <span className="text-xs italic text-muted-foreground">none published</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {container.ports.map((p, i) => {
                const isPublic = typeof p.publicPort === "number"
                return (
                  <span
                    key={`${p.type}-${p.privatePort}-${i}`}
                    data-slot="container-port-chip"
                    data-port-private={p.privatePort}
                    data-port-type={p.type}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs tabular-nums"
                  >
                    <span className="font-medium text-foreground">
                      {isPublic ? `${p.publicPort}` : `${p.privatePort}`}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{p.privatePort}</span>
                    <span className="uppercase text-muted-foreground/80">{p.type}</span>
                    {p.hostIp ? (
                      <span className="text-muted-foreground/70">@{p.hostIp}</span>
                    ) : null}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Env */}
      <div data-slot="container-env" className="border-b border-border p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Env ({container.env.length})
          </div>
          {hasMoreEnv ? (
            <button
              type="button"
              onClick={() => setShowAllEnv((v) => !v)}
              data-slot="container-env-toggle"
              className="text-xs font-medium text-foreground/80 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
            >
              {showAllEnv ? "ver menos" : "ver mais"}
            </button>
          ) : null}
        </div>
        {container.env.length === 0 ? (
          <span className="text-xs italic text-muted-foreground">no env vars</span>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1 text-left font-medium">key</th>
                  <th className="px-2 py-1 text-left font-medium">value</th>
                </tr>
              </thead>
              <tbody>
                {envToShow.map((e, i) => (
                  <tr
                    key={`${e.key}-${i}`}
                    data-slot="container-env-row"
                    className="border-t border-border first:border-t-0"
                  >
                    <td className="px-2 py-1 font-mono text-foreground/90">{e.key}</td>
                    <td className="px-2 py-1 font-mono text-foreground/90">
                      {e.masked ? (
                        <span
                          data-slot="container-env-masked"
                          className="tracking-widest text-muted-foreground"
                          title="valor ocultado"
                        >
                          •••
                        </span>
                      ) : (
                        e.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mounts */}
      {container.mounts && container.mounts.length > 0 ? (
        <div data-slot="container-mounts" className="p-3">
          <div className="mb-1.5 text-xs text-muted-foreground">Mounts</div>
          <ul className="flex flex-col gap-1">
            {container.mounts.map((m, i) => (
              <li
                key={`${m.source}-${i}`}
                data-slot="container-mount-row"
                className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 text-xs"
              >
                <code className="truncate font-mono text-foreground/90" title={m.source}>
                  {m.source}
                </code>
                <span className="text-muted-foreground">→</span>
                <code className="truncate font-mono text-foreground/90" title={m.destination}>
                  {m.destination}
                </code>
                <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {m.mode}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export { ContainerResourcePanel }
