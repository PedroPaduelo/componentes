import { DonutChart } from "@/components/ui/donut-chart"

import type { Example } from "./examples"

const PLAN_MIX = [
  { label: "Free", value: 7, className: "stroke-muted-foreground/50" },
  { label: "Pro", value: 9, className: "stroke-primary" },
  { label: "Enterprise", value: 4, className: "stroke-emerald-500" },
]

const total = PLAN_MIX.reduce((acc, s) => acc + s.value, 0)

const withLabelExample: Example = {
  title: "Distribuição de planos",
  description:
    "Mix da base de clientes com rótulo central sobreposto via wrapper relativo. No hover sobre um arco, o tooltip mostra o segmento, o valor e a participação (%).",
  code: `import { DonutChart } from "@/components/ui/donut-chart"

const segments = [
  { label: "Free", value: 7, className: "stroke-muted-foreground/50" },
  { label: "Pro", value: 9, className: "stroke-primary" },
  { label: "Enterprise", value: 4, className: "stroke-emerald-500" },
]

export function Demo() {
  return (
    <div className="relative" style={{ width: 168, height: 168 }}>
      <DonutChart segments={segments} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-foreground">20</span>
        <span className="text-[11px] text-muted-foreground">clientes</span>
      </div>
    </div>
  )
}`,
  render: (
    <div className="relative" style={{ width: 168, height: 168 }}>
      <DonutChart segments={PLAN_MIX} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-foreground">{total}</span>
        <span className="text-[11px] text-muted-foreground">clientes</span>
      </div>
    </div>
  ),
}

const thinExample: Example = {
  title: "Anel fino",
  description: "Mesmos segmentos com `thickness` reduzido e diâmetro menor.",
  code: `import { DonutChart } from "@/components/ui/donut-chart"

export function Demo() {
  return (
    <DonutChart
      size={120}
      thickness={12}
      segments={[
        { label: "Concluído", value: 72, className: "stroke-emerald-500" },
        { label: "Restante", value: 28, className: "stroke-muted-foreground/40" },
      ]}
    />
  )
}`,
  render: (
    <DonutChart
      size={120}
      thickness={12}
      segments={[
        { label: "Concluído", value: 72, className: "stroke-emerald-500" },
        { label: "Restante", value: 28, className: "stroke-muted-foreground/40" },
      ]}
    />
  ),
}

export const examplesDonutChart: Record<string, Example[]> = {
  "donut-chart": [withLabelExample, thinExample],
}
