/**
 * Examples — ContainerResourcePanel.
 *
 * 1. "Running healthy": container nginx-like, com saúde OK e env misto
 *    (alguns masked, alguns não), múltiplas portas, mounts.
 * 2. "Restarting unhealthy": container postgres-like, com restart count
 *    alto, health failing, sem mounts, sem portas públicas, sem env
 *    (cenário de crash loop).
 *
 * `code` (string) e `render` (JSX) mantidos em sincronia manual.
 */

import type { Example } from "@/data/examples"
import { ContainerResourcePanel } from "@/components/ui/container-resource-panel"
import type { ContainerMetrics } from "@/components/ui/container-resource-panel-types"

const runningHealthy: ContainerMetrics = {
  id: "a1f4b9c2d8e74f01ab3c5e2d9f8a7b61",
  name: "nginx-web-prod",
  image: "nginx",
  tag: "1.27.3-alpine",
  status: "running",
  createdAt: "2026-06-10T14:22:11Z",
  startedAt: "2026-06-10T14:22:18Z",
  ports: [
    { privatePort: 80, publicPort: 8080, type: "tcp", hostIp: "0.0.0.0" },
    { privatePort: 443, publicPort: 8443, type: "tcp", hostIp: "0.0.0.0" },
  ],
  cpu: { usagePct: 18.4, limitCores: 2, throttledPct: 0.2 },
  memory: { usageMB: 184, limitMB: 512, cacheMB: 36 },
  network: { rxMB: 248.6, txMB: 192.1 },
  blockIO: { readMB: 12.3, writeMB: 4.7 },
  restartCount: 0,
  restartLimit: 5,
  health: "healthy",
  uptimeSeconds: 4 * 86400 + 6 * 3600 + 12 * 60,
  env: [
    { key: "NGINX_HOST", value: "example.com" },
    { key: "NGINX_PORT", value: "80" },
    { key: "NGINX_WORKERS", value: "auto" },
    { key: "APP_DATABASE_URL", value: "postgres://app:***@db:5432/app", masked: true },
    { key: "APP_REDIS_URL", value: "redis://:***@cache:6379/0", masked: true },
    { key: "APP_JWT_SECRET", value: "***", masked: true },
    { key: "LOG_LEVEL", value: "info" },
    { key: "FEATURE_NEW_BILLING", value: "true" },
    { key: "SENTRY_DSN", value: "https://***@sentry.io/123", masked: true },
    { key: "OTEL_EXPORTER_OTLP_ENDPOINT", value: "http://otel:4317" },
  ],
  mounts: [
    { source: "/var/lib/nginx/html", destination: "/usr/share/nginx/html", mode: "ro" },
    { source: "/etc/nginx/conf.d", destination: "/etc/nginx/conf.d", mode: "ro" },
    { source: "nginx-cache", destination: "/var/cache/nginx", mode: "rw" },
  ],
}

const restartingUnhealthy: ContainerMetrics = {
  id: "b7e2c4d1f9a84b03ac6f8d5e2c1b9a70",
  name: "postgres-replica-02",
  image: "postgres",
  tag: "16.4-bookworm",
  status: "restarting",
  createdAt: "2026-06-12T09:01:00Z",
  startedAt: "2026-06-15T11:48:32Z",
  finishedAt: "2026-06-15T11:51:09Z",
  ports: [
    { privatePort: 5432, type: "tcp" },
  ],
  cpu: { usagePct: 94.2, limitCores: 1, throttledPct: 42.7 },
  memory: { usageMB: 956, limitMB: 1024, cacheMB: 128 },
  network: { rxMB: 5.1, txMB: 0.8 },
  blockIO: { readMB: 412.0, writeMB: 1284.5 },
  restartCount: 5,
  restartLimit: 5,
  health: "unhealthy",
  uptimeSeconds: 163,
  env: [],
  mounts: undefined,
}

const runningHealthyExample: Example = {
  title: "Running · healthy",
  description:
    "Container nginx-like em produção: CPU/MEM dentro do limite, health OK, 2 portas publicadas, env misto (alguns masked) e 3 mounts.",
  code: `const container: ContainerMetrics = {
  id: "a1f4b9c2d8e74f01ab3c5e2d9f8a7b61",
  name: "nginx-web-prod",
  image: "nginx",
  tag: "1.27.3-alpine",
  status: "running",
  createdAt: "2026-06-10T14:22:11Z",
  startedAt: "2026-06-10T14:22:18Z",
  ports: [
    { privatePort: 80, publicPort: 8080, type: "tcp" },
    { privatePort: 443, publicPort: 8443, type: "tcp" },
  ],
  cpu: { usagePct: 18.4, limitCores: 2, throttledPct: 0.2 },
  memory: { usageMB: 184, limitMB: 512, cacheMB: 36 },
  network: { rxMB: 248.6, txMB: 192.1 },
  blockIO: { readMB: 12.3, writeMB: 4.7 },
  restartCount: 0,
  restartLimit: 5,
  health: "healthy",
  uptimeSeconds: 4 * 86400 + 6 * 3600 + 12 * 60,
  env: [
    { key: "NGINX_HOST", value: "example.com" },
    { key: "APP_JWT_SECRET", value: "***", masked: true },
    // ... mais 8
  ],
  mounts: [
    { source: "/var/lib/nginx/html", destination: "/usr/share/nginx/html", mode: "ro" },
  ],
}

<ContainerResourcePanel container={container} />`,
  render: <ContainerResourcePanel container={runningHealthy} />,
}

const restartingUnhealthyExample: Example = {
  title: "Restarting · unhealthy (crash loop)",
  description:
    "Container postgres-like em loop de crash: CPU no talo, restart count = limite, health failing, sem mounts, sem env.",
  code: `const container: ContainerMetrics = {
  id: "b7e2c4d1f9a84b03ac6f8d5e2c1b9a70",
  name: "postgres-replica-02",
  image: "postgres",
  tag: "16.4-bookworm",
  status: "restarting",
  createdAt: "2026-06-12T09:01:00Z",
  startedAt: "2026-06-15T11:48:32Z",
  finishedAt: "2026-06-15T11:51:09Z",
  ports: [{ privatePort: 5432, type: "tcp" }],
  cpu: { usagePct: 94.2, limitCores: 1, throttledPct: 42.7 },
  memory: { usageMB: 956, limitMB: 1024, cacheMB: 128 },
  network: { rxMB: 5.1, txMB: 0.8 },
  blockIO: { readMB: 412.0, writeMB: 1284.5 },
  restartCount: 5,
  restartLimit: 5,
  health: "unhealthy",
  uptimeSeconds: 163,
  env: [],
}

<ContainerResourcePanel container={container} />`,
  render: <ContainerResourcePanel container={restartingUnhealthy} />,
}

export const examplesContainerResourcePanel: Record<string, Example[]> = {
  "container-resource-panel": [runningHealthyExample, restartingUnhealthyExample],
}
