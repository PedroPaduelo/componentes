import { ServerOverviewCard } from "@/components/ui/server-overview-card"
import type { ServerMetrics } from "@/components/ui/server-overview-card-types"

import type { Example } from "./examples"

/* ------------------------------------------------------------------ */
/*  Helpers determinísticos (datas relativas ao NOW local)             */
/* ------------------------------------------------------------------ */

function isoAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString()
}

/* ------------------------------------------------------------------ */
/*  Example 1 — API prod healthy                                       */
/* ------------------------------------------------------------------ */

const apiProdHealthy: ServerMetrics = {
  id: "api-prod-01",
  name: "api-prod-01",
  host: "ip-10-0-12-84.ec2.internal",
  role: "API prod",
  status: "online",
  cpu: {
    usagePct: 38,
    cores: 16,
    loadAvg: [0.61, 0.74, 0.82],
  },
  memory: {
    usedPct: 54,
    usedGB: 21.6,
    totalGB: 40,
    swapUsedPct: 2,
  },
  disks: [
    { mount: "/", usedPct: 41, usedGB: 82, totalGB: 200, readMBs: 12, writeMBs: 38 },
    { mount: "/var/log", usedPct: 28, usedGB: 56, totalGB: 200, readMBs: 4, writeMBs: 22 },
  ],
  network: {
    inMBs: 128,
    outMBs: 96,
    connectionsCount: 1284,
    establishedCount: 962,
  },
  uptimeSeconds: 12 * 86400 + 4 * 3600 + 18 * 60,
  processes: [
    {
      pid: 1842,
      name: "node",
      cpuPct: 18.4,
      memPct: 12.6,
      command: "/usr/bin/node /srv/api/server.js --cluster",
    },
    {
      pid: 2017,
      name: "nginx",
      cpuPct: 6.2,
      memPct: 1.8,
      command: "nginx: worker process",
    },
    {
      pid: 1523,
      name: "redis-server",
      cpuPct: 3.1,
      memPct: 4.7,
      command: "/usr/bin/redis-server 127.0.0.1:6379",
    },
    {
      pid: 988,
      name: "systemd",
      cpuPct: 0.4,
      memPct: 0.6,
    },
    {
      pid: 2231,
      name: "metrics-exporter",
      cpuPct: 0.9,
      memPct: 0.4,
      command: "/usr/local/bin/metrics-exporter --port=9100",
    },
  ],
  lastIncidentAt: isoAgo(7 * 86400),
  region: "us-east-1",
  zone: "us-east-1a",
}

const apiProdExample: Example = {
  title: "API prod · online",
  description:
    "Servidor saudável com CPU/memória em níveis nominais, 2 discos, rede ativa e top 5 processos em ordem de consumo.",
  code: `import { ServerOverviewCard } from "@/components/ui/server-overview-card"
import type { ServerMetrics } from "@/components/ui/server-overview-card-types"

const server: ServerMetrics = {
  id: "api-prod-01",
  name: "api-prod-01",
  host: "ip-10-0-12-84.ec2.internal",
  role: "API prod",
  status: "online",
  cpu: { usagePct: 38, cores: 16, loadAvg: [0.61, 0.74, 0.82] },
  memory: { usedPct: 54, usedGB: 21.6, totalGB: 40, swapUsedPct: 2 },
  disks: [
    { mount: "/", usedPct: 41, usedGB: 82, totalGB: 200, readMBs: 12, writeMBs: 38 },
    { mount: "/var/log", usedPct: 28, usedGB: 56, totalGB: 200, readMBs: 4, writeMBs: 22 },
  ],
  network: { inMBs: 128, outMBs: 96, connectionsCount: 1284, establishedCount: 962 },
  uptimeSeconds: 12 * 86400 + 4 * 3600 + 18 * 60,
  processes: [
    { pid: 1842, name: "node", cpuPct: 18.4, memPct: 12.6, command: "/usr/bin/node /srv/api/server.js --cluster" },
    { pid: 2017, name: "nginx", cpuPct: 6.2, memPct: 1.8, command: "nginx: worker process" },
    { pid: 1523, name: "redis-server", cpuPct: 3.1, memPct: 4.7 },
    { pid: 988, name: "systemd", cpuPct: 0.4, memPct: 0.6 },
    { pid: 2231, name: "metrics-exporter", cpuPct: 0.9, memPct: 0.4 },
  ],
  lastIncidentAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  region: "us-east-1",
  zone: "us-east-1a",
}

export function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <ServerOverviewCard server={server} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-3xl">
      <ServerOverviewCard server={apiProdHealthy} />
    </div>
  ),
}

/* ------------------------------------------------------------------ */
/*  Example 2 — DB master degraded (com incidente recente)            */
/* ------------------------------------------------------------------ */

const dbMasterDegraded: ServerMetrics = {
  id: "db-master-01",
  name: "db-master-01",
  host: "db-master.cluster-abc.us-east-1.rds.amazonaws.com",
  role: "DB master",
  status: "degraded",
  cpu: {
    usagePct: 78,
    cores: 32,
    loadAvg: [12.4, 10.9, 9.6],
  },
  memory: {
    usedPct: 88,
    usedGB: 110.5,
    totalGB: 128,
    swapUsedPct: 24,
  },
  disks: [
    {
      mount: "/data",
      usedPct: 91,
      usedGB: 1820,
      totalGB: 2000,
      readMBs: 384,
      writeMBs: 412,
    },
    { mount: "/wal", usedPct: 64, usedGB: 64, totalGB: 100, readMBs: 96, writeMBs: 188 },
    { mount: "/backup", usedPct: 38, usedGB: 380, totalGB: 1000, readMBs: 8, writeMBs: 6 },
  ],
  network: {
    inMBs: 512,
    outMBs: 480,
    connectionsCount: 4320,
    establishedCount: 3104,
  },
  uptimeSeconds: 47 * 86400 + 12 * 3600 + 5 * 60,
  processes: [
    {
      pid: 4218,
      name: "postgres",
      cpuPct: 64.2,
      memPct: 38.4,
      command: "postgres: writer process",
    },
    {
      pid: 4220,
      name: "postgres",
      cpuPct: 41.8,
      memPct: 22.1,
      command: "postgres: checkpointer",
    },
    {
      pid: 4231,
      name: "postgres",
      cpuPct: 28.4,
      memPct: 16.2,
      command: "postgres: autovacuum: db_prod",
    },
    {
      pid: 4112,
      name: "pgbouncer",
      cpuPct: 4.1,
      memPct: 1.2,
      command: "/usr/bin/pgbouncer -d /etc/pgbouncer.ini",
    },
    {
      pid: 3801,
      name: "node-exporter",
      cpuPct: 1.3,
      memPct: 0.8,
      command: "/usr/bin/node_exporter --web.listen=:9100",
    },
  ],
  lastIncidentAt: isoAgo(23 * 60),
  region: "us-east-1",
  zone: "us-east-1c",
}

const dbMasterExample: Example = {
  title: "DB master · degradado",
  description:
    "Master de Postgres sob pressão: CPU e memória altos, swap em 24%, disco /data em 91%, último incidente há 23 minutos.",
  code: `import { ServerOverviewCard } from "@/components/ui/server-overview-card"
import type { ServerMetrics } from "@/components/ui/server-overview-card-types"

const server: ServerMetrics = {
  id: "db-master-01",
  name: "db-master-01",
  host: "db-master.cluster-abc.us-east-1.rds.amazonaws.com",
  role: "DB master",
  status: "degraded",
  cpu: { usagePct: 78, cores: 32, loadAvg: [12.4, 10.9, 9.6] },
  memory: { usedPct: 88, usedGB: 110.5, totalGB: 128, swapUsedPct: 24 },
  disks: [
    { mount: "/data", usedPct: 91, usedGB: 1820, totalGB: 2000, readMBs: 384, writeMBs: 412 },
    { mount: "/wal", usedPct: 64, usedGB: 64, totalGB: 100, readMBs: 96, writeMBs: 188 },
    { mount: "/backup", usedPct: 38, usedGB: 380, totalGB: 1000, readMBs: 8, writeMBs: 6 },
  ],
  network: { inMBs: 512, outMBs: 480, connectionsCount: 4320, establishedCount: 3104 },
  uptimeSeconds: 47 * 86400 + 12 * 3600 + 5 * 60,
  processes: [
    { pid: 4218, name: "postgres", cpuPct: 64.2, memPct: 38.4, command: "postgres: writer process" },
    { pid: 4220, name: "postgres", cpuPct: 41.8, memPct: 22.1, command: "postgres: checkpointer" },
    { pid: 4231, name: "postgres", cpuPct: 28.4, memPct: 16.2, command: "postgres: autovacuum: db_prod" },
    { pid: 4112, name: "pgbouncer", cpuPct: 4.1, memPct: 1.2, command: "/usr/bin/pgbouncer -d /etc/pgbouncer.ini" },
    { pid: 3801, name: "node-exporter", cpuPct: 1.3, memPct: 0.8, command: "/usr/bin/node_exporter --web.listen=:9100" },
  ],
  lastIncidentAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
  region: "us-east-1",
  zone: "us-east-1c",
}

export function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <ServerOverviewCard server={server} />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-3xl">
      <ServerOverviewCard server={dbMasterDegraded} />
    </div>
  ),
}

export const examplesServerOverviewCard: Record<string, Example[]> = {
  "server-overview-card": [apiProdExample, dbMasterExample],
}
