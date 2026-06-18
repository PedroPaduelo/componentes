import { TraceWaterfall } from "@/components/ui/trace-waterfall"

import type { Example } from "./examples"

const basicExample: Example = {
  title: "Cascata de spans",
  description:
    "Cada span é uma barra posicionada por `start`/`duration` sobre `total`, indentada por `depth` e tingida pelo `status`. `valueLabel` define o número à direita.",
  code: `import { TraceWaterfall } from "@/components/ui/trace-waterfall"

const SPANS = [
  { id: "root", label: "Orders API", start: 0, duration: 320, status: "degraded", depth: 0, valueLabel: "320ms" },
  { id: "auth", label: "Auth", start: 18, duration: 46, status: "healthy", depth: 1, valueLabel: "46ms" },
  { id: "pg", label: "Postgres", start: 70, duration: 130, status: "degraded", depth: 1, valueLabel: "130ms" },
  { id: "pay", label: "Payments", start: 210, duration: 96, status: "critical", depth: 1, valueLabel: "96ms" },
]

export function Demo() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <TraceWaterfall spans={SPANS} total={320} />
    </div>
  )
}`,
  render: (
    <div className="w-full rounded-xl border border-border bg-card p-4">
      <TraceWaterfall
        total={320}
        spans={[
          { id: "root", label: "Orders API", start: 0, duration: 320, status: "degraded", depth: 0, valueLabel: "320ms" },
          { id: "auth", label: "Auth", start: 18, duration: 46, status: "healthy", depth: 1, valueLabel: "46ms" },
          { id: "pg", label: "Postgres", start: 70, duration: 130, status: "degraded", depth: 1, valueLabel: "130ms" },
          { id: "pay", label: "Payments", start: 210, duration: 96, status: "critical", depth: 1, valueLabel: "96ms" },
        ]}
      />
    </div>
  ),
}

const leafExample: Example = {
  title: "Serviço folha",
  description:
    "Com ≤1 span, `leafLabel` sinaliza que o serviço não tem dependências downstream. Sem `total`, a escala é inferida do maior `start + duration`.",
  code: `import { TraceWaterfall } from "@/components/ui/trace-waterfall"

export function Demo() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <TraceWaterfall
        spans={[{ id: "root", label: "Redis", start: 0, duration: 4, status: "healthy", valueLabel: "4ms" }]}
        leafLabel="Serviço folha — sem dependências downstream."
      />
    </div>
  )
}`,
  render: (
    <div className="w-full rounded-xl border border-border bg-card p-4">
      <TraceWaterfall
        spans={[{ id: "root", label: "Redis", start: 0, duration: 4, status: "healthy", valueLabel: "4ms" }]}
        leafLabel="Serviço folha — sem dependências downstream."
      />
    </div>
  ),
}

export const examplesTraceWaterfall: Record<string, Example[]> = {
  "trace-waterfall": [basicExample, leafExample],
}
