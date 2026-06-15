/**
 * Tipos do ServerOverviewCard.
 *
 * Card denso de overview de UM servidor/container — inspirado em New Relic /
 * Datadog "Host Summary". Mostra status, CPU + load, memória + swap, discos,
 * rede + conexões, top processos, uptime, último incidente, região/zona, e
 * (opcional) sparklines ao lado de cada métrica principal.
 *
 * Tudo determinístico: nenhum `Math.random`. A geração de séries históricas
 * (sparklines) usa o PRNG seedado local `mulberry32` (cópia minimalista
 * do usado em `observability-center-data.ts` — sem dependência cruzada).
 */

export type ServerStatus = "online" | "degraded" | "offline" | "unknown"

export type CpuMetric = {
  /** Uso de CPU em % (0..100). */
  usagePct: number
  /** Quantidade de cores lógicos. */
  cores: number
  /** Load average 1m / 5m / 15m. */
  loadAvg: [number, number, number]
}

export type MemoryMetric = {
  /** Uso de memória em % (0..100). */
  usedPct: number
  /** Memória usada em GB. */
  usedGB: number
  /** Memória total em GB. */
  totalGB: number
  /** Uso de swap em % (0..100). Opcional. */
  swapUsedPct?: number
}

export type DiskMetric = {
  /** Mount point (ex.: "/", "/var"). */
  mount: string
  /** Uso em % (0..100). */
  usedPct: number
  /** Espaço usado em GB. */
  usedGB: number
  /** Espaço total em GB. */
  totalGB: number
  /** Throughput de leitura em MB/s. */
  readMBs: number
  /** Throughput de escrita em MB/s. */
  writeMBs: number
}

export type NetworkMetric = {
  /** Throughput de entrada em MB/s. */
  inMBs: number
  /** Throughput de saída em MB/s. */
  outMBs: number
  /** Total de conexões (incl. TIME_WAIT, etc.). */
  connectionsCount: number
  /** Conexões estabelecidas (ESTABLISHED). */
  establishedCount: number
}

export type ProcessMetric = {
  /** Process ID. */
  pid: number
  /** Nome do processo. */
  name: string
  /** CPU% (0..100). */
  cpuPct: number
  /** Memória% (0..100). */
  memPct: number
  /** Comando completo (opcional — truncado na UI). */
  command?: string
}

/** Amostra de sparkline (0..1 normalizado OU valor bruto — UI decide). */
export type SparklinePoint = number

export type ServerMetrics = {
  id: string
  name: string
  host: string
  role: string
  status: ServerStatus
  cpu: CpuMetric
  memory: MemoryMetric
  disks: DiskMetric[]
  network: NetworkMetric
  uptimeSeconds: number
  /** Top 5 processos por consumo. */
  processes: ProcessMetric[]
  /** 12 amostras de CPU (mais recente à direita). */
  cpuHistory?: SparklinePoint[]
  /** 12 amostras de memória. */
  memoryHistory?: SparklinePoint[]
  /** 12 amostras de net in (MB/s). */
  netInHistory?: SparklinePoint[]
  /** 12 amostras de net out (MB/s). */
  netOutHistory?: SparklinePoint[]
  /** ISO string do último incidente (opcional). */
  lastIncidentAt?: string
  region?: string
  zone?: string
}

export type ServerOverviewCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  server: ServerMetrics
  /** Mostra sparklines ao lado de CPU e memória (default true). */
  showSparklines?: boolean
}
