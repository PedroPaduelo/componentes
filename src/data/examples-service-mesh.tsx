import { ServiceMesh } from "@/components/ui/service-mesh"

import type { Example } from "./examples"

const liveExample: Example = {
  title: "Malha viva com tráfego",
  description:
    "Nós ligados por arestas curvas com pacotes fluindo via requestAnimationFrame. O peso (`weight`) de cada nó pondera o tráfego; nós críticos/selecionados ganham radar pings.",
  code: `import { ServiceMesh } from "@/components/ui/service-mesh"

const NODES = [
  { id: "edge", label: "Edge", x: 80, y: 170, status: "healthy", weight: 5200, meta: "5.2k rps" },
  { id: "api", label: "API Gateway", x: 250, y: 170, status: "healthy", weight: 4800, meta: "4.8k rps" },
  { id: "orders", label: "Orders", x: 440, y: 90, status: "degraded", weight: 2100, meta: "2.1k rps" },
  { id: "cache", label: "Redis", x: 440, y: 250, status: "critical", weight: 3100, meta: "3.1k rps" },
  { id: "db", label: "Postgres", x: 620, y: 90, status: "healthy", weight: 1400, meta: "1.4k rps" },
]

const EDGES = [
  { from: "edge", to: "api" },
  { from: "api", to: "orders", bow: -30 },
  { from: "api", to: "cache", bow: 30 },
  { from: "orders", to: "db" },
  { from: "orders", to: "cache", bow: -22 },
]

export function Demo() {
  return (
    <div className="rounded-xl border border-border bg-card p-2">
      <ServiceMesh nodes={NODES} edges={EDGES} width={720} height={340} selectedId="orders" />
    </div>
  )
}`,
  render: (
    <div className="w-full rounded-xl border border-border bg-card p-2">
      <ServiceMesh
        nodes={[
          { id: "edge", label: "Edge", x: 80, y: 170, status: "healthy", weight: 5200, meta: "5.2k rps" },
          { id: "api", label: "API Gateway", x: 250, y: 170, status: "healthy", weight: 4800, meta: "4.8k rps" },
          { id: "orders", label: "Orders", x: 440, y: 90, status: "degraded", weight: 2100, meta: "2.1k rps" },
          { id: "cache", label: "Redis", x: 440, y: 250, status: "critical", weight: 3100, meta: "3.1k rps" },
          { id: "db", label: "Postgres", x: 620, y: 90, status: "healthy", weight: 1400, meta: "1.4k rps" },
        ]}
        edges={[
          { from: "edge", to: "api" },
          { from: "api", to: "orders", bow: -30 },
          { from: "api", to: "cache", bow: 30 },
          { from: "orders", to: "db" },
          { from: "orders", to: "cache", bow: -22 },
        ]}
        width={720}
        height={340}
        selectedId="orders"
      />
    </div>
  ),
}

const pausedExample: Example = {
  title: "Congelada (snapshot de severidade)",
  description:
    "Com `paused`, o tráfego congela e a malha vira um snapshot estático — útil para destacar as cores de severidade das arestas e nós.",
  code: `import { ServiceMesh } from "@/components/ui/service-mesh"

const NODES = [
  { id: "a", label: "Web", x: 110, y: 110, status: "healthy" },
  { id: "b", label: "Workers", x: 360, y: 110, status: "degraded" },
  { id: "c", label: "Queue", x: 360, y: 250, status: "critical" },
]

const EDGES = [
  { from: "a", to: "b" },
  { from: "b", to: "c", bow: 24 },
]

export function Demo() {
  return (
    <div className="rounded-xl border border-border bg-card p-2">
      <ServiceMesh nodes={NODES} edges={EDGES} width={520} height={340} paused />
    </div>
  )
}`,
  render: (
    <div className="w-full rounded-xl border border-border bg-card p-2">
      <ServiceMesh
        nodes={[
          { id: "a", label: "Web", x: 110, y: 110, status: "healthy" },
          { id: "b", label: "Workers", x: 360, y: 110, status: "degraded" },
          { id: "c", label: "Queue", x: 360, y: 250, status: "critical" },
        ]}
        edges={[
          { from: "a", to: "b" },
          { from: "b", to: "c", bow: 24 },
        ]}
        width={520}
        height={340}
        paused
      />
    </div>
  ),
}

export const examplesServiceMesh: Record<string, Example[]> = {
  "service-mesh": [liveExample, pausedExample],
}
