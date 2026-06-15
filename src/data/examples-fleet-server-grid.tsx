import { FleetServerGrid } from "@/components/ui/fleet-server-grid"
import type { ServerMetrics } from "@/components/ui/fleet-server-grid-types"
import type { Example } from "@/data/examples"

/* -------------------------------------------------------------------------- */
/*                        Mock determinístico (seed fixo)                    */
/* -------------------------------------------------------------------------- */

/**
 * PRNG seedado (mulberry32). O mesmo seed → mesma sequência.
 * Garante que `cpuHistory`/random jitter sejam reprodutíveis em SSR e dev/build.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function buildHistory(rnd: () => number, base: number): number[] {
  const out: number[] = []
  for (let i = 0; i < 12; i++) {
    const v = base + (rnd() - 0.5) * 30
    out.push(Math.max(0, Math.min(100, Math.round(v))))
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*                              Example 1                                     */
/* -------------------------------------------------------------------------- */

const fleetStatus = [
  { status: "online" as const, count: 5 },
  { status: "degraded" as const, count: 2 },
  { status: "offline" as const, count: 1 },
]

const serversByStatus: ServerMetrics[] = []
{
  let idx = 0
  for (const bucket of fleetStatus) {
    for (let i = 0; i < bucket.count; i++) {
      idx++
      const id = `srv-${idx.toString().padStart(2, "0")}`
      const rnd = mulberry32(seedFromString(id))
      const cpuBase =
        bucket.status === "offline"
          ? 0
          : bucket.status === "degraded"
            ? 70 + Math.round(rnd() * 20)
            : 25 + Math.round(rnd() * 35)
      const memBase =
        bucket.status === "offline"
          ? 0
          : 35 + Math.round(rnd() * 45)
      const role = (() => {
        const r = rnd()
        if (r < 0.4) return "api"
        if (r < 0.7) return "web"
        if (r < 0.9) return "worker"
        return "db"
      })()
      const region = (() => {
        const r = rnd()
        if (r < 0.4) return "us-east-1"
        if (r < 0.7) return "eu-west-1"
        return "sa-east-1"
      })()
      serversByStatus.push({
        id,
        name: `${role}-${idx.toString().padStart(2, "0")}`,
        host: `10.0.${Math.floor(rnd() * 4)}.${idx + 10}`,
        role,
        status: bucket.status,
        cpu: {
          usagePct: cpuBase,
          cores: [2, 4, 8, 16][Math.floor(rnd() * 4)],
          loadAvg: [
            cpuBase / 25,
            cpuBase / 30,
            cpuBase / 35,
          ] as [number, number, number],
        },
        memory: {
          usedPct: memBase,
          usedGB: Math.round((memBase / 100) * 16 * 10) / 10,
          totalGB: 16,
        },
        disks: [
          {
            mount: "/",
            usedPct: bucket.status === "offline" ? 0 : 40 + Math.round(rnd() * 50),
            usedGB: bucket.status === "offline" ? 0 : Math.round((40 + rnd() * 50) * 0.5),
            totalGB: 100,
            readMBs: Math.round(rnd() * 200 * 10) / 10,
            writeMBs: Math.round(rnd() * 120 * 10) / 10,
          },
        ],
        network: {
          inMBs: Math.round(rnd() * 100 * 10) / 10,
          outMBs: Math.round(rnd() * 80 * 10) / 10,
          connectionsCount: Math.floor(rnd() * 2000),
          establishedCount: Math.floor(rnd() * 1500),
        },
        uptimeSeconds:
          bucket.status === "offline"
            ? 0
            : Math.floor(rnd() * 30 * 86400) + 86400,
        processes: [
          { pid: 1, name: "node", cpuPct: cpuBase * 0.4, memPct: memBase * 0.3 },
          {
            pid: 142,
            name: "postgres",
            cpuPct: cpuBase * 0.25,
            memPct: memBase * 0.4,
          },
        ],
        cpuHistory: bucket.status === "offline" ? [] : buildHistory(rnd, cpuBase),
        lastIncidentAt:
          bucket.status === "degraded"
            ? new Date(Date.now() - Math.floor(rnd() * 12) * 3600 * 1000).toISOString()
            : undefined,
        region,
      })
    }
  }
}

const fleetStatusExample: Example = {
  title: "8 servidores, agrupado por status",
  description:
    "Grid responsivo de tiles compactos. Cada tile mostra nome, host, status dot, 3 mini-barras (CPU/MEM/DISK), sparkline de CPU, uptime, função e região. Modal de detalhe abre ao clicar.",
  code: `<FleetServerGrid
  groupBy="status"
  servers={[
    /* 5 online, 2 degraded, 1 offline — ver arquivo de examples */
  ]}
/>`,
  render: (
    <div className="w-full">
      <FleetServerGrid servers={serversByStatus} groupBy="status" />
    </div>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              Example 2                                     */
/* -------------------------------------------------------------------------- */

const serversByRole: ServerMetrics[] = (() => {
  const roles = [
    { role: "api", count: 4, baseCpu: 35, baseMem: 50, region: "us-east-1" },
    { role: "web", count: 3, baseCpu: 22, baseMem: 40, region: "us-east-1" },
    { role: "worker", count: 3, baseCpu: 55, baseMem: 60, region: "eu-west-1" },
    { role: "db", count: 2, baseCpu: 65, baseMem: 75, region: "eu-west-1" },
  ]
  const all: ServerMetrics[] = []
  let idx = 0
  for (const r of roles) {
    for (let i = 0; i < r.count; i++) {
      idx++
      const id = `${r.role}-${idx.toString().padStart(2, "0")}`
      const rnd = mulberry32(seedFromString(id))
      const cpuBase = Math.max(
        5,
        r.baseCpu + Math.round((rnd() - 0.5) * 25),
      )
      const memBase = Math.max(
        5,
        r.baseMem + Math.round((rnd() - 0.5) * 20),
      )
      const isDegraded = rnd() < 0.15
      const status = isDegraded ? "degraded" : "online"
      all.push({
        id,
        name: id,
        host: `10.${r.role === "db" ? 1 : 2}.${Math.floor(rnd() * 4)}.${idx + 20}`,
        role: r.role,
        status,
        cpu: {
          usagePct: cpuBase,
          cores: 8,
          loadAvg: [cpuBase / 25, cpuBase / 30, cpuBase / 35] as [
            number,
            number,
            number,
          ],
        },
        memory: {
          usedPct: memBase,
          usedGB: Math.round((memBase / 100) * 32 * 10) / 10,
          totalGB: 32,
        },
        disks: [
          {
            mount: "/",
            usedPct: 50 + Math.round(rnd() * 30),
            usedGB: 100,
            totalGB: 200,
            readMBs: Math.round(rnd() * 250 * 10) / 10,
            writeMBs: Math.round(rnd() * 180 * 10) / 10,
          },
        ],
        network: {
          inMBs: Math.round(rnd() * 200 * 10) / 10,
          outMBs: Math.round(rnd() * 150 * 10) / 10,
          connectionsCount: Math.floor(rnd() * 3000),
          establishedCount: Math.floor(rnd() * 2000),
        },
        uptimeSeconds: Math.floor(rnd() * 60 * 86400) + 86400,
        processes: [
          {
            pid: 7,
            name: r.role === "db" ? "postgres" : r.role,
            cpuPct: cpuBase * 0.3,
            memPct: memBase * 0.4,
          },
        ],
        cpuHistory: buildHistory(rnd, cpuBase),
        lastIncidentAt: isDegraded
          ? new Date(Date.now() - 4 * 3600 * 1000).toISOString()
          : undefined,
        region: r.region,
      })
    }
  }
  return all
})()

const fleetRoleExample: Example = {
  title: "12 servidores, agrupado por função",
  description:
    "Versão maior com 12 servidores divididos entre api, web, worker e db. Group por função cria seções com header; sort por CPU destaca os workers mais carregados.",
  code: `<FleetServerGrid
  groupBy="role"
  sortBy="cpu"
  servers={[
    /* 12 servidores: 4 api, 3 web, 3 worker, 2 db */
  ]}
/>`,
  render: (
    <div className="w-full">
      <FleetServerGrid
        servers={serversByRole}
        groupBy="role"
        sortBy="cpu"
      />
    </div>
  ),
}

export const examplesFleetServerGrid: Record<string, Example[]> = {
  "fleet-server-grid": [fleetStatusExample, fleetRoleExample],
}
