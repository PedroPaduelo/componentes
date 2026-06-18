/**
 * Tipos públicos do `ContainerResourcePanel`.
 *
 * Modelo de dados para UM container Docker, inspirado em Portainer /
 * Docker Desktop. Tudo é read-only: o componente é uma VIEW dos
 * `ContainerMetrics` passados via prop — não há polling nem simulação
 * interna.
 *
 * Convenções:
 *  - Status: ciclo de vida do container (running/exited/...).
 *  - Health: probe de saúde configurada (healthy/unhealthy/starting/none).
 *  - Cores reativas: emerald-500 (running+healthy), sky-400 (starting),
 *    amber-500 (restarting/degraded), rose-500 (exited/unhealthy/dead),
 *    gray-500 (paused/unknown) — aplicadas via data-status.
 *  - Sem dependências externas; sem PRNG (dados vêm prontos do prop).
 */

export type ContainerStatus =
  | "running"
  | "exited"
  | "restarting"
  | "paused"
  | "dead"
  | "created"

export type ContainerHealth = "healthy" | "unhealthy" | "starting" | "none"

export type ContainerPort = {
  privatePort: number
  publicPort?: number
  type: "tcp" | "udp"
  hostIp?: string
}

export type ContainerCpu = {
  /** Percentual de uso atual (0-100). */
  usagePct: number
  /** Limite de cores alocado para o container. */
  limitCores: number
  /** Percentual de throttling (0-100). Opcional. */
  throttledPct?: number
}

export type ContainerMemory = {
  /** Uso atual em MB. */
  usageMB: number
  /** Limite em MB. */
  limitMB: number
  /** Cache de páginas em MB (informativo). */
  cacheMB: number
}

export type ContainerNet = {
  /** Bytes recebidos em MB. */
  rxMB: number
  /** Bytes transmitidos em MB. */
  txMB: number
}

export type ContainerBlockIO = {
  /** Lido do disco em MB. */
  readMB: number
  /** Escrito no disco em MB. */
  writeMB: number
}

export type ContainerEnvVar = {
  key: string
  value: string
  /** Quando true, o valor é exibido mascarado ("•••") até reveal. */
  masked?: boolean
}

export type ContainerMount = {
  source: string
  destination: string
  /** Modo de montagem: "ro", "rw", "Z", etc. */
  mode: string
}

export type ContainerMetrics = {
  id: string
  name: string
  image: string
  tag: string
  status: ContainerStatus
  /** ISO-8601 timestamp. */
  createdAt: string
  /** ISO-8601 timestamp. */
  startedAt: string
  /** ISO-8601 timestamp. Opcional (exited/paused). */
  finishedAt?: string
  ports: ContainerPort[]
  cpu: ContainerCpu
  memory: ContainerMemory
  network: ContainerNet
  blockIO: ContainerBlockIO
  restartCount: number
  /** Limite de restarts configurado (opcional). */
  restartLimit?: number
  health: ContainerHealth
  uptimeSeconds: number
  env: ContainerEnvVar[]
  mounts?: ContainerMount[]
}
