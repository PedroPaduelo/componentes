import { DonutBreakdown } from "@/components/ui/donut-breakdown"
import type { DonutBreakdownSegment } from "@/components/ui/donut-breakdown"

import type { Example } from "./examples"

const PLAN_SEGMENTS: DonutBreakdownSegment[] = [
  { label: "Free", value: 7, className: "stroke-muted-foreground/50", dotClassName: "bg-muted-foreground/50" },
  { label: "Pro", value: 7, className: "stroke-primary", dotClassName: "bg-primary" },
  { label: "Enterprise", value: 6, className: "stroke-emerald-500", dotClassName: "bg-emerald-500" },
]

const withCenterExample: Example = {
  title: "Distribuição com total no centro",
  description:
    "Donut proporcional com legenda à direita e um rótulo central (ex.: total). Cada segmento define a cor do arco (`className`) e da bolinha (`dotClassName`).",
  code: `import { DonutBreakdown } from "@/components/ui/donut-breakdown"
import type { DonutBreakdownSegment } from "@/components/ui/donut-breakdown"

const segments: DonutBreakdownSegment[] = [
  { label: "Free", value: 7, className: "stroke-muted-foreground/50", dotClassName: "bg-muted-foreground/50" },
  { label: "Pro", value: 7, className: "stroke-primary", dotClassName: "bg-primary" },
  { label: "Enterprise", value: 6, className: "stroke-emerald-500", dotClassName: "bg-emerald-500" },
]

export function Demo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <DonutBreakdown
        title="Distribuição de planos"
        segments={segments}
        centerLabel={20}
        centerSublabel="clientes"
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <DonutBreakdown
        title="Distribuição de planos"
        segments={PLAN_SEGMENTS}
        centerLabel={20}
        centerSublabel="clientes"
      />
    </div>
  ),
}

const verticalExample: Example = {
  title: "Legenda abaixo (orientation vertical)",
  description:
    "Com `orientation=\"vertical\"`, a legenda fica sempre abaixo do donut — útil em colunas estreitas. Sem `centerLabel`, o miolo fica vazio.",
  code: `import { DonutBreakdown } from "@/components/ui/donut-breakdown"

export function Demo() {
  return (
    <div className="w-full max-w-xs rounded-xl border border-border bg-card p-5">
      <DonutBreakdown
        orientation="vertical"
        size={140}
        segments={[
          { label: "Orgânico", value: 52, className: "stroke-primary" },
          { label: "Indicação", value: 28, className: "stroke-emerald-500" },
          { label: "Social", value: 20, className: "stroke-amber-500" },
        ]}
      />
    </div>
  )
}`,
  render: (
    <div className="w-full max-w-xs rounded-xl border border-border bg-card p-5">
      <DonutBreakdown
        orientation="vertical"
        size={140}
        segments={[
          { label: "Orgânico", value: 52, className: "stroke-primary" },
          { label: "Indicação", value: 28, className: "stroke-emerald-500" },
          { label: "Social", value: 20, className: "stroke-amber-500" },
        ]}
      />
    </div>
  ),
}

export const examplesDonutBreakdown: Record<string, Example[]> = {
  "donut-breakdown": [withCenterExample, verticalExample],
}
