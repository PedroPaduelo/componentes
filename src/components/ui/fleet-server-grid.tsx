import * as React from "react"
import { SearchIcon, AlertTriangleIcon, ActivityIcon, MapPinIcon, ServerIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  FleetServerGridProps,
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

function ServerTile({ server, onSelect }: ServerTileProps) {
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

  const incident = hasRecentIncident(server.lastIncidentAt, Date.now())

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

      {incident ? (
        <Badge
          variant="destructive"
          className="self-start"
          data-slot="fleet-server-incident-badge"
        >
          <AlertTriangleIcon className="mr-1 size-3" aria-hidden="true" />
          Incidente recente
        </Badge>
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
    </div>
  )
}

export { FleetServerGrid }
