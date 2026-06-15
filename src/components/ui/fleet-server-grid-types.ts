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
  lastIncidentAt?: string
  region?: string
  zone?: string
}

export type FleetServerGridSortBy = "name" | "cpu" | "memory" | "status"

export type FleetServerGridGroupBy = "none" | "role" | "region" | "status"

export type FleetServerGridProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de servidores exibidos. */
  servers: ServerMetrics[]
  /** Callback disparado ao clicar em um tile (antes do modal). */
  onServerClick?: (id: string) => void
  /** Critério de ordenação dos tiles. Default: "status". */
  sortBy?: FleetServerGridSortBy
  /** Critério de agrupamento em seções. Default: "none". */
  groupBy?: FleetServerGridGroupBy
  /**
   * Render prop opcional para o detalhe expandido.
   * Quando omitido, o modal mostra um card "Detalhes" simples.
   */
  renderDetail?: (server: ServerMetrics) => React.ReactNode
}
