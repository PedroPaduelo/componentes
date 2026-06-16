/**
 * Tipos do componente FleetServerGrid.
 *
 * Importante: o tipo `ServerMetrics` é declarado LOCALMENTE aqui (mesmo shape
 * do `server-overview-card-types.ts`) para evitar dependência circular entre
 * as duas branches do lote "Componentes Obs". O orchestrator, na consolidação
 * final, pode deduplicar se quiser.
 */

export type ServerStatus = "online" | "degraded" | "offline" | "unknown"

export type ServerProcess = {
  pid: number
  name: string
  cpuPct: number
  memPct: number
  command?: string
}

export type ServerDisk = {
  mount: string
  usedPct: number
  usedGB: number
  totalGB: number
  readMBs: number
  writeMBs: number
}

export type ServerNetwork = {
  inMBs: number
  outMBs: number
  connectionsCount: number
  establishedCount: number
}

/** Severidade de um incidente de servidor. */
export type ServerIncidentSeverity = "low" | "medium" | "high" | "critical"

/** Tipo do evento dentro da timeline de um incidente. */
export type ServerIncidentEventType =
  | "detect"
  | "page"
  | "escalate"
  | "note"
  | "deploy"
  | "mitigate"
  | "resolve"
  | "postmortem"
  | "rollback"

/** Um evento dentro da timeline de um incidente. */
export type ServerIncidentEvent = {
  id: string
  /** ISO 8601 do momento do evento. */
  t: string
  type: ServerIncidentEventType
  /** Texto curto do evento. */
  title: string
  /** Descrição opcional. */
  description?: string
  /** Ator/owner (opcional) — quem fez a ação. */
  actor?: string
}

/** Métricas do servidor NO MOMENTO do incidente (snapshot). */
export type ServerIncidentMetrics = {
  cpuPct: number
  memPct: number
  netInMBs: number
  netOutMBs: number
  activeConnections: number
}

/**
 * Detalhes completos de um incidente recente de um servidor.
 * Aparece como `recentIncident` no `ServerMetrics` (opcional) e é
 * mostrado no `IncidentDetailDialog` quando o consumidor clica no
 * badge "Incidente recente" do tile do servidor.
 */
export type ServerIncident = {
  id: string
  title: string
  severity: ServerIncidentSeverity
  /** ISO 8601 do início. */
  startedAt: string
  /** ISO 8601 da resolução (opcional — null significa incidente aberto). */
  resolvedAt?: string
  /** Resumo legível do que aconteceu. */
  summary: string
  /** Causa provável diagnosticada (opcional). */
  suspectedCause?: string
  /** Tipo do incidente — ex.: "outage", "degradation", "high-cpu", "disk-full". */
  type: string
  /** Eventos cronológicos da timeline. */
  events: ServerIncidentEvent[]
  /** Snapshot de métricas no momento do pico. */
  metricsAtIncident: ServerIncidentMetrics
}

export type ServerMetrics = {
  id: string
  name: string
  host: string
  role: string
  status: ServerStatus
  cpu: { usagePct: number; cores: number; loadAvg: [number, number, number] }
  memory: { usedPct: number; usedGB: number; totalGB: number; swapUsedPct?: number }
  disks: ServerDisk[]
  network: ServerNetwork
  uptimeSeconds: number
  processes: ServerProcess[]
  cpuHistory?: number[]
  /** ISO 8601 do último incidente (opcional). Mantido p/ compat — use `recentIncident` para detalhes. */
  lastIncidentAt?: string
  /** Detalhes do último incidente (opcional). Quando presente, o badge "Incidente recente" vira clicável. */
  recentIncident?: ServerIncident
  region?: string
  zone?: string
}

export type FleetServerGridSortBy = "name" | "cpu" | "memory" | "status"

export type FleetServerGridGroupBy = "none" | "role" | "region" | "status"

export type FleetServerGridProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  servers: ServerMetrics[]
  onServerClick?: (id: string) => void
  sortBy?: FleetServerGridSortBy
  groupBy?: FleetServerGridGroupBy
  /**
   * Callback opcional ao clicar no badge "Incidente recente" de um
   * tile. Quando fornecido, o detail dialog built-in NÃO abre —
   * o consumidor fica responsável por mostrar os detalhes como
   * preferir (navegação, modal customizado, etc.).
   *
   * Quando omitido, o componente abre seu próprio Dialog com 4 tabs
   * (Resumo / Causa / Timeline / Métricas).
   */
  onIncidentClick?: (server: ServerMetrics, incident: ServerIncident) => void
  renderDetail?: (server: ServerMetrics) => React.ReactNode
}
