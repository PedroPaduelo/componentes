import * as React from "react"
import {
  SearchIcon,
  AlertTriangleIcon,
  ActivityIcon,
  MapPinIcon,
  ServerIcon,
  SirenIcon,
  WrenchIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ClockIcon,
  TagIcon,
  TrendingUpIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  FleetServerGridProps,
  ServerIncident,
  ServerIncidentEvent,
  ServerIncidentEventType,
  ServerIncidentSeverity,
  ServerMetrics,
  ServerStatus,
} from "@/components/ui/fleet-server-grid-types"

/* -------------------------------------------------------------------------- */
/*                          helpers determinísticos                           */
/* -------------------------------------------------------------------------- */

/**
 * Mapeia status → cor semântica (classes Tailwind literais).
 * Mantidas como constantes para satisfazer a regra de não-interpolação
 * de classes do Tailwind v4 (purga em prod).
 */
const STATUS_DOT: Record<ServerStatus, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-rose-500",
  unknown: "bg-zinc-400",
}

const STATUS_BAR_OK = "bg-emerald-500"
const STATUS_BAR_WARN = "bg-amber-500"
const STATUS_BAR_BAD = "bg-rose-500"

const STATUS_LABEL: Record<ServerStatus, string> = {
  online: "Online",
  degraded: "Degraded",
  offline: "Offline",
  unknown: "Desconhecido",
}

const STATUS_PRIORITY: Record<ServerStatus, number> = {
  offline: 0,
  degraded: 1,
  unknown: 2,
  online: 3,
}

const GROUP_HEADER: Record<"role" | "region" | "status", string> = {
  role: "Função",
  region: "Região",
  status: "Status",
}

const SORT_OPTIONS: Array<{
  value: NonNullable<FleetServerGridProps["sortBy"]>
  label: string
}> = [
  { value: "status", label: "Status" },
  { value: "name", label: "Nome" },
  { value: "cpu", label: "CPU" },
  { value: "memory", label: "Memória" },
]

const GROUP_OPTIONS: Array<{
  value: NonNullable<FleetServerGridProps["groupBy"]>
  label: string
}> = [
  { value: "none", label: "Sem agrupamento" },
  { value: "status", label: "Por status" },
  { value: "role", label: "Por função" },
  { value: "region", label: "Por região" },
]

/** Cor de uma mini-barra dado o percentual de uso. */
function barColor(pct: number): string {
  if (pct >= 85) return STATUS_BAR_BAD
  if (pct >= 65) return STATUS_BAR_WARN
  return STATUS_BAR_OK
}

/** Formata uptime em segundos para "Xd Yh Zm" (curto). */
function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const total = Math.floor(seconds)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/** Verifica se houve incidente nas últimas 24h. */
function hasRecentIncident(at: string | undefined, now: number): boolean {
  if (!at) return false
  const ts = Date.parse(at)
  if (Number.isNaN(ts)) return false
  return now - ts <= 24 * 60 * 60 * 1000
}

/* -------------------------------------------------------------------------- */
/*                              ServerTile                                    */
/* -------------------------------------------------------------------------- */

type ServerTileProps = {
  server: ServerMetrics
  onSelect: (server: ServerMetrics) => void
  /**
   * Callback opcional ao clicar no badge "Incidente recente".
   * Quando fornecido, o detail dialog built-in NÃO abre.
   */
  onIncidentClick?: (server: ServerMetrics, incident: ServerIncident) => void
}

const SPARK_W = 80
const SPARK_H = 24
const SPARK_POINTS = 12

/**
 * Gera pontos de sparkline a partir de `cpuHistory` se houver,
 * ou constrói uma série determinística baseada no id+cpu atual.
 * Determinístico: sem Math.random — sempre mesmo output para mesma entrada.
 */
function buildSparkPoints(server: ServerMetrics): number[] {
  if (server.cpuHistory && server.cpuHistory.length > 0) {
    return server.cpuHistory
  }
  // hash determinístico a partir do id (caracteres), sem random
  const seed = server.id
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)
  const base = server.cpu.usagePct
  const pts: number[] = []
  for (let i = 0; i < SPARK_POINTS; i++) {
    const wobble = (((seed >>> ((i % 6) * 3)) & 0xff) / 255 - 0.5) * 18
    const v = Math.max(0, Math.min(100, base + wobble))
    pts.push(Math.round(v))
  }
  return pts
}

function ServerTile({
  server,
  onSelect,
  onIncidentClick,
}: ServerTileProps) {
  const sparkPoints = React.useMemo(() => buildSparkPoints(server), [server])
  const max = Math.max(...sparkPoints, 1)
  const min = Math.min(...sparkPoints, 0)
  const range = Math.max(1, max - min)

  const cpuPct = Math.round(server.cpu.usagePct)
  const memPct = Math.round(server.memory.usedPct)
  const diskPct =
    server.disks.length > 0
      ? Math.round(
          server.disks.reduce((acc, d) => acc + d.usedPct, 0) /
            server.disks.length,
        )
      : 0

  // Considera incidente recente se:
  //  - tem `recentIncident` com `startedAt` nas últimas 24h, OU
  //  - tem `lastIncidentAt` legacy nas últimas 24h
  const recentIncident = server.recentIncident
  const incidentFlag =
    !!recentIncident ||
    hasRecentIncident(server.lastIncidentAt, Date.now())

  // Constrói o path da sparkline. Comprime no espaço SPARK_W × SPARK_H.
  const path = sparkPoints
    .map((v, i) => {
      const x = (i / (sparkPoints.length - 1)) * SPARK_W
      const y = SPARK_H - ((v - min) / range) * (SPARK_H - 4) - 2
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")

  const areaPath = `${path} L${SPARK_W} ${SPARK_H} L0 ${SPARK_H} Z`

  const sparkStroke =
    server.status === "offline"
      ? "stroke-rose-500"
      : server.status === "degraded"
        ? "stroke-amber-500"
        : "stroke-emerald-500"
  const sparkFill =
    server.status === "offline"
      ? "fill-rose-500/20"
      : server.status === "degraded"
        ? "fill-amber-500/20"
        : "fill-emerald-500/20"

  return (
    <button
      type="button"
      onClick={() => onSelect(server)}
      data-slot="fleet-server-tile"
      data-server-id={server.id}
      data-server-status={server.status}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-3 text-left",
        "transition-colors hover:border-foreground/30 hover:bg-accent/40",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
      )}
    >
      {/* Topo: nome + status dot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {server.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {server.host}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            data-slot="fleet-server-status-dot"
            className={cn("size-2.5 rounded-full", STATUS_DOT[server.status])}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {STATUS_LABEL[server.status]}
          </span>
        </div>
      </div>

      {/* Mini-barras: CPU / MEM / DISK */}
      <div className="flex flex-col gap-1.5" data-slot="fleet-server-bars">
        <Bar
          label="CPU"
          pct={cpuPct}
          color={barColor(cpuPct)}
          statusOverride={server.status === "offline" ? STATUS_BAR_BAD : undefined}
        />
        <Bar
          label="MEM"
          pct={memPct}
          color={barColor(memPct)}
          statusOverride={server.status === "offline" ? STATUS_BAR_BAD : undefined}
        />
        <Bar
          label="DISK"
          pct={diskPct}
          color={barColor(diskPct)}
          statusOverride={server.status === "offline" ? STATUS_BAR_BAD : undefined}
        />
      </div>

      {/* Sparkline */}
      <div className="flex items-center justify-between gap-2">
        <svg
          data-slot="fleet-server-sparkline"
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
          width={SPARK_W}
          height={SPARK_H}
          className="shrink-0"
          aria-label={`Histórico de CPU de ${server.name}`}
        >
          <path d={areaPath} className={cn(sparkFill, "stroke-none")} />
          <path
            d={path}
            className={cn(sparkStroke, "fill-none")}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ActivityIcon className="size-3" aria-hidden="true" />
          <span className="tabular-nums">{cpuPct}%</span>
        </div>
      </div>

      {/* Footer: uptime + role + incident */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ServerIcon className="size-3" aria-hidden="true" />
          <span className="font-medium text-foreground">{server.role}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {server.region ? (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3" aria-hidden="true" />
              {server.region}
            </span>
          ) : null}
          <span aria-label="Uptime">uptime {formatUptime(server.uptimeSeconds)}</span>
        </div>
      </div>

      {incidentFlag ? (
        <button
          type="button"
          onClick={(ev) => {
            // Impede que o click propague para o tile (que abre o
            // detail dialog de métricas do servidor inteiro).
            ev.stopPropagation()
            onIncidentClick?.(server, recentIncident ?? {
              id: "legacy",
              title: "Incidente recente",
              severity: "medium",
              startedAt: server.lastIncidentAt!,
              summary: "Detalhes do incidente não disponíveis.",
              type: "unknown",
              events: [],
              metricsAtIncident: {
                cpuPct: server.cpu.usagePct,
                memPct: server.memory.usedPct,
                netInMBs: server.network.inMBs,
                netOutMBs: server.network.outMBs,
                activeConnections: server.network.establishedCount,
              },
            })
          }}
          className="group/incident inline-flex items-center gap-1 self-start rounded-full border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-500 transition-colors hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50"
          data-slot="fleet-server-incident-badge"
          aria-label={`Ver detalhes do incidente recente de ${server.name}`}
        >
          <AlertTriangleIcon className="size-3" aria-hidden="true" />
          Incidente recente
          {recentIncident && (
            <span
              aria-hidden="true"
              className="ml-0.5 text-rose-500/70 group-hover/incident:text-rose-500"
            >
              ›
            </span>
          )}
        </button>
      ) : null}
    </button>
  )
}

type BarProps = {
  label: string
  pct: number
  color: string
  statusOverride?: string
}

function Bar({ label, pct, color, statusOverride }: BarProps) {
  const finalColor = statusOverride ?? color
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 shrink-0 font-medium text-muted-foreground">
        {label}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", finalColor)}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right tabular-nums text-foreground">
        {pct}%
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            FleetServerGrid                                 */
/* -------------------------------------------------------------------------- */

function sortServers(
  list: ServerMetrics[],
  sortBy: NonNullable<FleetServerGridProps["sortBy"]>,
): ServerMetrics[] {
  const copy = list.slice()
  switch (sortBy) {
    case "name":
      copy.sort((a, b) => a.name.localeCompare(b.name))
      return copy
    case "cpu":
      copy.sort((a, b) => b.cpu.usagePct - a.cpu.usagePct)
      return copy
    case "memory":
      copy.sort((a, b) => b.memory.usedPct - a.memory.usedPct)
      return copy
    case "status":
      copy.sort((a, b) => {
        const pa = STATUS_PRIORITY[a.status]
        const pb = STATUS_PRIORITY[b.status]
        if (pa !== pb) return pa - pb
        return a.name.localeCompare(b.name)
      })
      return copy
  }
}

type Group = { key: string; label: string; servers: ServerMetrics[] }

function groupServers(
  list: ServerMetrics[],
  groupBy: NonNullable<FleetServerGridProps["groupBy"]>,
): Group[] {
  if (groupBy === "none") {
    return [{ key: "all", label: "Todos", servers: list }]
  }
  const map = new Map<string, Group>()
  for (const s of list) {
    let key = "—"
    if (groupBy === "status") key = s.status
    else if (groupBy === "role") key = s.role
    else if (groupBy === "region") key = s.region ?? "—"
    if (!map.has(key)) {
      map.set(key, { key, label: key, servers: [] })
    }
    map.get(key)!.servers.push(s)
  }
  // ordenação estável: status usa a priority, demais alfabético
  if (groupBy === "status") {
    return Array.from(map.values()).sort((a, b) => {
      const pa = STATUS_PRIORITY[a.key as ServerStatus] ?? 99
      const pb = STATUS_PRIORITY[b.key as ServerStatus] ?? 99
      return pa - pb
    })
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
}

function defaultRenderDetail(server: ServerMetrics) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DetailField label="Host" value={server.host} />
        <DetailField label="Função" value={server.role} />
        <DetailField label="Status" value={STATUS_LABEL[server.status]} />
        <DetailField
          label="Região"
          value={server.region ?? server.zone ?? "—"}
        />
        <DetailField label="Cores" value={String(server.cpu.cores)} />
        <DetailField label="Uptime" value={formatUptime(server.uptimeSeconds)} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailField
          label="CPU"
          value={`${Math.round(server.cpu.usagePct)}%`}
        />
        <DetailField
          label="Memória"
          value={`${Math.round(server.memory.usedPct)}%`}
        />
        <DetailField
          label="Disco"
          value={
            server.disks.length > 0
              ? `${Math.round(
                  server.disks.reduce((a, d) => a + d.usedPct, 0) /
                    server.disks.length,
                )}%`
              : "—"
          }
        />
        <DetailField
          label="Conexões"
          value={String(server.network.connectionsCount)}
        />
      </div>
      {server.disks.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Discos
          </p>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1 text-left font-medium">Mount</th>
                  <th className="px-2 py-1 text-right font-medium">Usado</th>
                  <th className="px-2 py-1 text-right font-medium">Read</th>
                  <th className="px-2 py-1 text-right font-medium">Write</th>
                </tr>
              </thead>
              <tbody>
                {server.disks.map((d) => (
                  <tr key={d.mount} className="border-t border-border">
                    <td className="px-2 py-1 font-mono text-foreground">
                      {d.mount}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {d.usedPct}% ({d.usedGB}GB / {d.totalGB}GB)
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {d.readMBs}MB/s
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {d.writeMBs}MB/s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {server.processes.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Top processos
          </p>
          <ul className="space-y-1 text-xs">
            {server.processes.slice(0, 5).map((p) => (
              <li
                key={p.pid}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-2 py-1"
              >
                <span className="truncate font-mono text-foreground">
                  {p.name}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  CPU {p.cpuPct.toFixed(1)}% · MEM {p.memPct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}

function FleetServerGrid({
  servers,
  onServerClick,
  onIncidentClick,
  sortBy = "status",
  groupBy = "none",
  renderDetail,
  className,
  ...props
}: FleetServerGridProps) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<ServerMetrics | null>(null)
  const [open, setOpen] = React.useState(false)
  const [activeSort, setActiveSort] = React.useState(sortBy)
  const [activeGroup, setActiveGroup] = React.useState(groupBy)
  // Incidente selecionado para o detail dialog built-in. Null quando
  // nenhum. Só é controlado pelo componente se `onIncidentClick` for
  // omitido (caso contrário, o consumidor é dono da ação de click).
  const [selectedIncident, setSelectedIncident] = React.useState<{
    server: ServerMetrics
    incident: ServerIncident
  } | null>(null)

  // Handler padrão para o badge "Incidente recente" — abre o detail
  // dialog built-in. Se o consumidor passar `onIncidentClick`, esse
  // handler é sobrescrito (vide prop drilling no ServerTile).
  const handleIncident = React.useCallback(
    (server: ServerMetrics, incident: ServerIncident) => {
      setSelectedIncident({ server, incident })
    },
    [],
  )

  // Reflete mudanças de prop em estado interno (controlado → uncontrolled).
  React.useEffect(() => setActiveSort(sortBy), [sortBy])
  React.useEffect(() => setActiveGroup(groupBy), [groupBy])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return servers
    return servers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.host.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        (s.region ?? "").toLowerCase().includes(q),
    )
  }, [servers, query])

  const sorted = React.useMemo(
    () => sortServers(filtered, activeSort),
    [filtered, activeSort],
  )
  const groups = React.useMemo(
    () => groupServers(sorted, activeGroup),
    [sorted, activeGroup],
  )

  const counts = React.useMemo(() => {
    const c: Record<ServerStatus, number> = {
      online: 0,
      degraded: 0,
      offline: 0,
      unknown: 0,
    }
    for (const s of servers) c[s.status]++
    return c
  }, [servers])

  const handleSelect = React.useCallback(
    (server: ServerMetrics) => {
      setSelected(server)
      setOpen(true)
      onServerClick?.(server.id)
    },
    [onServerClick],
  )

  return (
    <div
      data-slot="fleet-server-grid"
      className={cn("flex w-full flex-col gap-4", className)}
      {...props}
    >
      {/* Header: totalizadores + sort + groupBy + busca */}
      <div
        data-slot="fleet-server-grid-header"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">
            {servers.length} servidores
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-500"
            />
            {counts.online} online
          </span>
          {counts.degraded > 0 ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-amber-500"
              />
              {counts.degraded} degraded
            </span>
          ) : null}
          {counts.offline > 0 ? (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-rose-500"
              />
              {counts.offline} offline
            </span>
          ) : null}
          {counts.unknown > 0 ? (
            <span className="flex items-center gap-1 text-zinc-500">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-zinc-400"
              />
              {counts.unknown} desconhecidos
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              data-slot="fleet-server-grid-search"
              type="search"
              placeholder="Filtrar por nome, host, função…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-56 pl-8 text-xs"
              aria-label="Filtrar servidores"
            />
          </div>
          <Select
            value={activeSort}
            onValueChange={(v) =>
              setActiveSort(v as NonNullable<FleetServerGridProps["sortBy"]>)
            }
          >
            <SelectTrigger
              data-slot="fleet-server-grid-sort"
              className="h-8 w-32 text-xs"
              aria-label="Ordenar por"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={activeGroup}
            onValueChange={(v) =>
              setActiveGroup(
                v as NonNullable<FleetServerGridProps["groupBy"]>,
              )
            }
          >
            <SelectTrigger
              data-slot="fleet-server-grid-groupby"
              className="h-8 w-40 text-xs"
              aria-label="Agrupar por"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUP_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de tiles, opcionalmente agrupado */}
      <div className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <div
            data-slot="fleet-server-grid-empty"
            className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground"
          >
            Nenhum servidor corresponde ao filtro.
          </div>
        ) : (
          groups.map((group) => (
            <section
              key={group.key}
              data-slot="fleet-server-grid-section"
              data-group-key={group.key}
              className="flex flex-col gap-3"
            >
              {activeGroup !== "none" ? (
                <header className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>
                    {GROUP_HEADER[activeGroup as "role" | "region" | "status"]}
                    :
                  </span>
                  <span className="text-foreground">{group.label}</span>
                  <span className="text-muted-foreground">
                    · {group.servers.length}
                  </span>
                </header>
              ) : null}
              <div
                data-slot="fleet-server-grid-tiles"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              >
                {group.servers.map((server) => (
                  <ServerTile
                    key={server.id}
                    server={server}
                    onSelect={handleSelect}
                    onIncidentClick={onIncidentClick ?? handleIncident}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Dialog de detalhe */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[85vh] max-w-2xl overflow-y-auto"
          data-slot="fleet-server-grid-detail"
        >
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2.5 rounded-full",
                      STATUS_DOT[selected.status],
                    )}
                  />
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  {selected.host} · {selected.role} ·{" "}
                  {STATUS_LABEL[selected.status]}
                </DialogDescription>
              </DialogHeader>
              {renderDetail ? (
                renderDetail(selected)
              ) : (
                defaultRenderDetail(selected)
              )}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/*
       * Incident detail dialog built-in. Só é renderizado/controlado
       * pelo componente quando o consumidor NÃO passou `onIncidentClick`.
       * Se passou, o consumidor é dono da ação e o dialog fica
       * permanentemente fechado.
       */}
      {!onIncidentClick && (
        <IncidentDetailDialog
          server={selectedIncident?.server ?? null}
          incident={selectedIncident?.incident ?? null}
          onOpenChange={(open) => {
            if (!open) setSelectedIncident(null)
          }}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                          IncidentDetailDialog                              */
/* -------------------------------------------------------------------------- */

const SEVERITY_TONE: Record<
  ServerIncidentSeverity,
  { chip: string; dot: string; text: string; ring: string }
> = {
  low: {
    chip: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    dot: "bg-sky-500",
    text: "text-sky-500",
    ring: "ring-sky-500/40",
  },
  medium: {
    chip: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-500",
    ring: "ring-amber-500/40",
  },
  high: {
    chip: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    dot: "bg-orange-500",
    text: "text-orange-500",
    ring: "ring-orange-500/40",
  },
  critical: {
    chip: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-500",
    ring: "ring-rose-500/40",
  },
}

const SEVERITY_LABEL: Record<ServerIncidentSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
}

const EVENT_TYPE_ICON: Record<
  ServerIncidentEventType,
  React.ComponentType<{ className?: string }>
> = {
  detect: SirenIcon,
  page: AlertTriangleIcon,
  escalate: TrendingUpIcon,
  note: FileTextIcon,
  deploy: WrenchIcon,
  mitigate: WrenchIcon,
  resolve: CheckCircle2Icon,
  postmortem: FileTextIcon,
  rollback: WrenchIcon,
}

const EVENT_TYPE_TONE: Record<
  ServerIncidentEventType,
  string
> = {
  detect: "text-rose-500",
  page: "text-rose-500",
  escalate: "text-amber-500",
  note: "text-muted-foreground",
  deploy: "text-violet-500",
  mitigate: "text-amber-500",
  resolve: "text-emerald-500",
  postmortem: "text-sky-500",
  rollback: "text-violet-500",
}

/** Diferença legível entre duas datas ISO (ex.: "1h 23min"). */
function durationLabel(startIso: string, endIso?: string): string {
  const start = Date.parse(startIso)
  const end = endIso ? Date.parse(endIso) : Date.now()
  if (Number.isNaN(start) || Number.isNaN(end)) return "—"
  const totalMin = Math.max(0, Math.round((end - start) / 60000))
  if (totalMin < 1) return "<1min"
  if (totalMin < 60) return `${totalMin}min`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** HH:mm:ss estável a partir de ISO (não depende de locale do host). */
function hhMmSs(iso: string): string {
  const m = /^.*T(\d{2}:\d{2}:\d{2})/.exec(iso)
  return m ? m[1] : iso
}

/** Tempo relativo estável (sem Date.now, em minutos). Usa a data de início
 * como referência para o "agora" fictício. */
function relativeLabel(iso: string, refIso: string): string {
  const t = Date.parse(iso)
  const r = Date.parse(refIso)
  if (Number.isNaN(t) || Number.isNaN(r)) return iso
  const min = Math.round((t - r) / 60000)
  if (min < 0) return `em ${Math.abs(min)}min`
  if (min === 0) return "agora"
  if (min < 60) return `+${min}min`
  const h = Math.floor(min / 60)
  return `+${h}h ${min % 60}min`
}

function IncidentSummaryTab({
  server,
  incident,
}: {
  server: ServerMetrics
  incident: ServerIncident
}) {
  const tone = SEVERITY_TONE[incident.severity]
  return (
    <div
      data-slot="fsg-incident-summary"
      className="flex flex-col gap-3 rounded-md border border-border bg-background/60 p-3"
    >
      <div className="flex items-baseline gap-3">
        <span className={cn("size-2.5 shrink-0 rounded-full", tone.dot)} aria-hidden />
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
          {SEVERITY_LABEL[incident.severity]} · {incident.type}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{incident.title}</p>
      <p className="text-xs text-muted-foreground">{incident.summary}</p>
      <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2 text-[11px] sm:grid-cols-2">
        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">Servidor</dt>
          <dd className="font-mono text-foreground">{server.name} ({server.host})</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">Início</dt>
          <dd className="font-mono text-foreground">
            {hhMmSs(incident.startedAt)}
            {incident.resolvedAt && (
              <span className="ml-1.5 text-muted-foreground">
                · durou {durationLabel(incident.startedAt, incident.resolvedAt)}
              </span>
            )}
          </dd>
        </div>
        {incident.resolvedAt && (
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Resolvido</dt>
            <dd className="font-mono text-foreground">{hhMmSs(incident.resolvedAt)}</dd>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-foreground">
            {incident.resolvedAt ? "Resolvido" : "Em andamento"}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function IncidentCauseTab({
  server,
  incident,
}: {
  server: ServerMetrics
  incident: ServerIncident
}) {
  return (
    <div
      data-slot="fsg-incident-cause"
      className="flex flex-col gap-3 rounded-md border border-border bg-background/60 p-3"
    >
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Causa provável
        </p>
        <p className="text-sm text-foreground">
          {incident.suspectedCause ?? "Não identificada."}
        </p>
      </div>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Métricas no pico do incidente
        </p>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <SnapshotTile
            label="CPU"
            value={`${Math.round(incident.metricsAtIncident.cpuPct)}%`}
            danger={incident.metricsAtIncident.cpuPct > 85}
          />
          <SnapshotTile
            label="Memória"
            value={`${Math.round(incident.metricsAtIncident.memPct)}%`}
            danger={incident.metricsAtIncident.memPct > 90}
          />
          <SnapshotTile
            label="Net in"
            value={`${incident.metricsAtIncident.netInMBs}MB/s`}
            danger={false}
          />
          <SnapshotTile
            label="Net out"
            value={`${incident.metricsAtIncident.netOutMBs}MB/s`}
            danger={false}
          />
          <SnapshotTile
            label="Conexões"
            value={String(incident.metricsAtIncident.activeConnections)}
            danger={false}
          />
        </dl>
      </div>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Snapshot do servidor no momento
        </p>
        <p className="text-[11px] text-muted-foreground">
          {server.name} estava com {Math.round(server.cpu.usagePct)}% de CPU
          e {Math.round(server.memory.usedPct)}% de memória. Status atual: {" "}
          <span className="font-mono text-foreground">{server.status}</span>.
        </p>
      </div>
    </div>
  )
}

function SnapshotTile({
  label,
  value,
  danger,
}: {
  label: string
  value: string
  danger: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2 text-center",
        danger
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-border bg-muted/30",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          danger ? "text-rose-500" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function IncidentTimelineTab({
  events,
  startedAt,
}: {
  events: ServerIncidentEvent[]
  startedAt: string
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Sem eventos registrados na timeline deste incidente.
      </p>
    )
  }
  return (
    <ol
      data-slot="fsg-incident-timeline"
      className="flex flex-col gap-0.5 rounded-md border border-border bg-background/60 p-2"
    >
      {events.map((ev) => {
        const Icon = EVENT_TYPE_ICON[ev.type] ?? AlertTriangleIcon
        const tone = EVENT_TYPE_TONE[ev.type] ?? "text-muted-foreground"
        return (
          <li
            key={ev.id}
            data-slot="fsg-incident-event"
            data-type={ev.type}
            className="flex items-start gap-2 rounded px-2 py-1.5 text-[11px] hover:bg-muted/30"
          >
            <span className={cn("mt-0.5 shrink-0", tone)}>
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground tabular-nums">
                  {hhMmSs(ev.t)}
                </span>
                <span className={cn("font-semibold uppercase tracking-wider text-[10px]", tone)}>
                  {ev.type}
                </span>
                {ev.actor && (
                  <span className="text-muted-foreground">por {ev.actor}</span>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {relativeLabel(ev.t, startedAt)}
                </span>
              </div>
              <p className="mt-0.5 text-foreground">{ev.title}</p>
              {ev.description && (
                <p className="text-muted-foreground">{ev.description}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function IncidentDetailDialog({
  server,
  incident,
  onOpenChange,
}: {
  server: ServerMetrics | null
  incident: ServerIncident | null
  onOpenChange: (open: boolean) => void
}) {
  const open = server !== null && incident !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="fsg-incident-dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        {server && incident && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    SEVERITY_TONE[incident.severity].dot,
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-sm">
                    Incidente em {server.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    {server.host} · {server.role} · {SEVERITY_LABEL[incident.severity]}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    SEVERITY_TONE[incident.severity].chip,
                  )}
                >
                  <TagIcon className="size-3" />
                  {incident.type}
                </span>
                {!incident.resolvedAt && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-rose-500">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Em andamento
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <ClockIcon className="size-3" />
                  Início {hhMmSs(incident.startedAt)}
                </span>
              </div>
            </DialogHeader>

            <Tabs defaultValue="summary" className="mt-3">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="summary" className="gap-1.5">
                  <FileTextIcon className="size-3.5" /> Resumo
                </TabsTrigger>
                <TabsTrigger value="cause" className="gap-1.5">
                  <WrenchIcon className="size-3.5" /> Causa
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-1.5">
                  <ActivityIcon className="size-3.5" /> Timeline
                </TabsTrigger>
                <TabsTrigger value="metrics" className="gap-1.5">
                  <TrendingUpIcon className="size-3.5" /> Métricas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-3">
                <IncidentSummaryTab server={server} incident={incident} />
              </TabsContent>

              <TabsContent value="cause" className="mt-3">
                <IncidentCauseTab server={server} incident={incident} />
              </TabsContent>

              <TabsContent value="timeline" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Eventos cronológicos ({incident.events.length})
                </div>
                <IncidentTimelineTab
                  events={incident.events}
                  startedAt={incident.startedAt}
                />
              </TabsContent>

              <TabsContent value="metrics" className="mt-3">
                <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Métricas atuais do servidor
                </div>
                <dl className="grid grid-cols-2 gap-2 rounded-md border border-border bg-background/60 p-3 text-[11px] sm:grid-cols-4">
                  <SnapshotTile
                    label="CPU"
                    value={`${Math.round(server.cpu.usagePct)}%`}
                    danger={server.cpu.usagePct > 85}
                  />
                  <SnapshotTile
                    label="Memória"
                    value={`${Math.round(server.memory.usedGB)}/${Math.round(server.memory.totalGB)}GB`}
                    danger={server.memory.usedPct > 90}
                  />
                  <SnapshotTile
                    label="Disco"
                    value={`${server.disks[0]?.usedPct ?? 0}%`}
                    danger={(server.disks[0]?.usedPct ?? 0) > 90}
                  />
                  <SnapshotTile
                    label="Conexões"
                    value={String(server.network.establishedCount)}
                    danger={false}
                  />
                </dl>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Comparação: no pico do incidente, CPU estava em{" "}
                  {Math.round(incident.metricsAtIncident.cpuPct)}%, memória em{" "}
                  {Math.round(incident.metricsAtIncident.memPct)}%.
                </p>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onOpenChange(false)}
                data-slot="fsg-incident-close"
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

export { FleetServerGrid }
